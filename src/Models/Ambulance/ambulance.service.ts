import { prisma } from "@/lib/prisma";
import type { IAmbulance } from "./ambulance.interface";

const createAmbulanceInDb = async (payload: IAmbulance) => {
  const { vehicleNumber, type, capacity, stationZone } = payload;

  const existing = await prisma.ambulance.findUnique({
    where: { vehicleNumber },
  });
  if (existing && !existing.deletedAt) {
    throw new Error("Ambulance with this vehicle number already exists");
  }

  return prisma.ambulance.create({
    data: {
      vehicleNumber,
      type,
      capacity,
      stationZone,
    },
  });
};

const getAllAmbulancesFromDb = async (query: any) => {
  const { availability, stationZone, sortBy, sortOrder, page = "1", limit = "10" } = query;
  const where: any = { deletedAt: null };
  if (availability) where.availability = availability.toUpperCase();
  if (stationZone) where.stationZone = { contains: stationZone, mode: "insensitive" };

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const orderBy: any = {};
  if (sortBy) orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";

  const data = await prisma.ambulance.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { _count: { select: { trips: true } } },
    orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: "desc" },
  });

  const total = await prisma.ambulance.count({ where });

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

const getAmbulanceByIdFromDb = async (ambulanceId: string) => {
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    include: {
      trips: {
        include: { request: true, driver: true, hospital: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!ambulance || ambulance.deletedAt) {
    throw new Error("Ambulance not found");
  }
  return ambulance;
};

const updateAmbulanceInDb = async (ambulanceId: string, payload: Partial<IAmbulance>) => {
  const existing = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
  });
  if (!existing || existing.deletedAt) {
    throw new Error("Ambulance not found");
  }

  return prisma.ambulance.update({
    where: { id: ambulanceId },
    data: {
      ...(payload.type && { type: payload.type }),
      ...(payload.capacity && { capacity: payload.capacity }),
      ...(payload.stationZone && { stationZone: payload.stationZone }),
    },
  });
};

const setAvailabilityInDb = async (ambulanceId: string, availability: string) => {
  const existing = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
  });
  if (!existing || existing.deletedAt) {
    throw new Error("Ambulance not found");
  }
  if (!["AVAILABLE", "BUSY", "OFFLINE"].includes(availability.toUpperCase())) {
    throw new Error("Availability must be AVAILABLE, BUSY or OFFLINE");
  }

  return prisma.ambulance.update({
    where: { id: ambulanceId },
    data: { availability: availability.toUpperCase() as any },
  });
};

const deleteAmbulanceInDb = async (ambulanceId: string) => {
  const existing = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
  });
  if (!existing || existing.deletedAt) {
    throw new Error("Ambulance not found");
  }

  return prisma.ambulance.update({
    where: { id: ambulanceId },
    data: { deletedAt: new Date(), availability: "OFFLINE" as any },
  });
};

export const ambulanceService = {
  createAmbulanceInDb,
  getAllAmbulancesFromDb,
  getAmbulanceByIdFromDb,
  updateAmbulanceInDb,
  setAvailabilityInDb,
  deleteAmbulanceInDb,
};
