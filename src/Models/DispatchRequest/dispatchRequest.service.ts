import { prisma } from "@/lib/prisma";
import type { IDispatchRequest } from "./dispatchRequest.interface";

const createRequestInDb = async (patientId: string, payload: IDispatchRequest) => {
  const { priority, patientName, contact, pickupLocation, note } = payload;

  const request = await prisma.dispatchRequest.create({
    data: {
      patientId,
      priority: (priority?.toUpperCase() || "MEDIUM") as any,
      patientName,
      contact,
      pickupLocation,
      note: note ?? null,
    },
    include: {
      patient: { omit: { password: true } },
    },
  });

  return request;
};

const getMyRequestsFromDb = async (patientId: string, query: any) => {
  const { status, priority, page = "1", limit = "10" } = query;
  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

  const where: any = { patientId };
  if (status) where.status = status.toUpperCase();
  if (priority) where.priority = priority.toUpperCase();

  const data = await prisma.dispatchRequest.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { trip: true },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.dispatchRequest.count({ where });

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

const getRequestByIdFromDb = async (requestId: string, userId: string, role: string) => {
  const request = await prisma.dispatchRequest.findUnique({
    where: { id: requestId },
    include: {
      patient: { omit: { password: true } },
      trip: { include: { ambulance: true, driver: true, hospital: true } },
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }
  if (role !== "DISPATCHER" && role !== "ADMIN" && request.patientId !== userId) {
    throw new Error("You cannot access this request");
  }
  return request;
};

const cancelRequestInDb = async (requestId: string, userId: string) => {
  const request = await prisma.dispatchRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) {
    throw new Error("Request not found");
  }
  if (request.patientId !== userId) {
    throw new Error("You cannot cancel this request");
  }
  if (request.status !== "PENDING") {
    throw new Error("Only pending requests can be cancelled");
  }

  return prisma.dispatchRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" as any },
  });
};

const searchRequestsInDb = async (query: any) => {
  const { q, status, page = "1", limit = "10" } = query;
  const where: any = {};

  if (q) {
    where.OR = [
      { patientName: { contains: q, mode: "insensitive" } },
      { contact: { contains: q, mode: "insensitive" } },
      { pickupLocation: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status.toUpperCase();

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.dispatchRequest.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { trip: true, patient: { omit: { password: true } } },
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.dispatchRequest.count({ where });

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

export const dispatchRequestService = {
  createRequestInDb,
  getMyRequestsFromDb,
  getRequestByIdFromDb,
  cancelRequestInDb,
  searchRequestsInDb,
};
