import { prisma } from "@/lib/prisma";
import type { IDispatchPayload } from "./trip.interface";

const TRIP_STATES: Record<string, string[]> = {
  DISPATCHED: ["EN_ROUTE"],
  EN_ROUTE: ["AT_PICKUP", "CANCELLED"],
  AT_PICKUP: ["TRANSPORTING"],
  TRANSPORTING: ["ARRIVED"],
  ARRIVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const isValidTransition = (from: string, to: string) => {
  return TRIP_STATES[from]?.includes(to);
};

const dispatchTripInDb = async (requestId: string, actorId: string, actorRole: string, payload: IDispatchPayload) => {
  const { ambulanceId, driverId, distanceKm, fare } = payload;

  const request = await prisma.dispatchRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) {
    throw new Error("Dispatch request not found");
  }
  if (request.status !== "PENDING") {
    throw new Error("Only pending requests can be dispatched");
  }
  if (request.patientId === actorId) {
    throw new Error("A patient cannot dispatch their own request");
  }

  const existingTrip = await prisma.trip.findUnique({ where: { requestId } });
  if (existingTrip) {
    throw new Error("A trip already exists for this request");
  }

  const result = await prisma.$transaction(async (tx) => {
    let ambulance: any;
    let driver: any;

    if (ambulanceId && driverId) {
      ambulance = await tx.ambulance.findUnique({ where: { id: ambulanceId } });
      driver = await tx.driver.findUnique({ where: { id: driverId } });

      if (!ambulance || ambulance.deletedAt || ambulance.availability !== "AVAILABLE") {
        throw new Error("Selected ambulance is not available");
      }
      if (!driver || driver.deletedAt || driver.availability !== "AVAILABLE") {
        throw new Error("Selected driver is not available");
      }
    } else {
      ambulance = await tx.ambulance.findFirst({
        where: { availability: "AVAILABLE", deletedAt: null },
      });
      driver = await tx.driver.findFirst({
        where: { availability: "AVAILABLE", deletedAt: null },
      });
      if (!ambulance || !driver) {
        throw new Error("No available ambulance or driver right now");
      }
    }

    const trip = await tx.trip.create({
      data: {
        requestId,
        ambulanceId: ambulance.id,
        driverId: driver.id,
        patientId: request.patientId,
        distanceKm: distanceKm ?? null,
        fare: fare ?? null,
      },
      include: { ambulance: true, driver: true, request: true },
    });

    await tx.ambulance.update({
      where: { id: ambulance.id },
      data: { availability: "BUSY" },
    });
    await tx.driver.update({
      where: { id: driver.id },
      data: { availability: "BUSY" },
    });
    await tx.dispatchRequest.update({
      where: { id: requestId },
      data: { status: "DISPATCHED" },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as any,
        action: "DISPATCH",
        entity: "Trip",
        entityId: trip.id,
        meta: { requestId, ambulanceId: ambulance.id, driverId: driver.id },
      },
    });

    return trip;
  });

  return result;
};

const getTripByIdFromDb = async (tripId: string, userId: string, role: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      request: true,
      ambulance: true,
      driver: { include: { user: { omit: { password: true } } } },
      hospital: true,
      payment: true,
    },
  });

  if (!trip) {
    throw new Error("Trip not found");
  }
  if (role !== "DISPATCHER" && role !== "ADMIN" && trip.patientId !== userId) {
    throw new Error("You cannot access this trip");
  }
  return trip;
};

const updateTripStatusInDb = async (tripId: string, status: string, actorId: string, actorRole: string) => {
  const next = status.toUpperCase();

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new Error("Trip not found");
  }
  if (!isValidTransition(trip.status, next)) {
    throw new Error(`Cannot transition from ${trip.status} to ${next}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: next as any,
        ...(next === "EN_ROUTE" && { startedAt: new Date() }),
        ...(next === "COMPLETED" && { completedAt: new Date() }),
      },
      include: { request: true },
    });

    if (next === "COMPLETED") {
      await tx.ambulance.update({
        where: { id: trip.ambulanceId },
        data: { availability: "AVAILABLE" },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { availability: "AVAILABLE" },
      });
    }

    if (next === "CANCELLED") {
      await tx.dispatchRequest.update({
        where: { id: trip.requestId },
        data: { status: "CANCELLED" },
      });
      await tx.ambulance.update({
        where: { id: trip.ambulanceId },
        data: { availability: "AVAILABLE" },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { availability: "AVAILABLE" },
      });
    }

    await tx.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as any,
        action: `TRIP_STATUS_${next}`,
        entity: "Trip",
        entityId: tripId,
        meta: { from: trip.status, to: next },
      },
    });

    return updated;
  });

  return result;
};

const assignHospitalInDb = async (tripId: string, hospitalId: string, actorId: string, actorRole: string) => {
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });
  if (!hospital || hospital.deletedAt) {
    throw new Error("Hospital not found");
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new Error("Trip not found");
  }
  if (!["TRANSPORTING", "AT_PICKUP", "EN_ROUTE"].includes(trip.status)) {
    throw new Error("Hospital can only be assigned during transport");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({
      where: { id: tripId },
      data: { hospitalId },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as any,
        action: "ASSIGN_HOSPITAL",
        entity: "Trip",
        entityId: tripId,
        meta: { hospitalId },
      },
    });
    return updated;
  });

  return result;
};

const getMyTripsFromDb = async (userId: string, role: string, query: any) => {
  const { status, page = "1", limit = "10" } = query;
  const where: any = {};
  if (role === "PATIENT") {
    where.patientId = userId;
  }
  if (status) where.status = status.toUpperCase();

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.trip.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { request: true, ambulance: true, driver: true, hospital: true },
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.trip.count({ where });

  return {
    meta: {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      total,
      totalPages: Math.ceil(total / Number.parseInt(limit)),
    },
    data,
  };
};

export const tripService = {
  dispatchTripInDb,
  getTripByIdFromDb,
  updateTripStatusInDb,
  assignHospitalInDb,
  getMyTripsFromDb,
};
