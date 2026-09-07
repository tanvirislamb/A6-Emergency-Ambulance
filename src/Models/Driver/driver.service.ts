import { prisma } from "@/lib/prisma";
import type { IDriver } from "./driver.interface";

const createDriverInDb = async (payload: IDriver) => {
  const { userId, name, phone, licenseNo } = payload;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found to associate as driver");
  }

  const existing = await prisma.driver.findUnique({ where: { userId } });
  if (existing && !existing.deletedAt) {
    throw new Error("This user already has a driver profile");
  }

  return prisma.driver.create({
    data: { userId, name, phone, licenseNo },
    include: { user: { omit: { password: true } } },
  });
};

const getAllDriversFromDb = async (query: any) => {
  const { availability, search, page = "1", limit = "10" } = query;
  const where: any = { deletedAt: null };
  if (availability) where.availability = availability.toUpperCase();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { licenseNo: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.driver.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { user: { omit: { password: true } } },
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.driver.count({ where });

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

const updateDriverInDb = async (driverId: string, payload: Partial<IDriver>) => {
  const existing = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!existing || existing.deletedAt) {
    throw new Error("Driver not found");
  }

  return prisma.driver.update({
    where: { id: driverId },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.phone && { phone: payload.phone }),
      ...(payload.licenseNo && { licenseNo: payload.licenseNo }),
    },
  });
};

const setAvailabilityInDb = async (driverId: string, availability: string) => {
  const existing = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!existing || existing.deletedAt) {
    throw new Error("Driver not found");
  }
  if (!["AVAILABLE", "BUSY", "OFFLINE"].includes(availability.toUpperCase())) {
    throw new Error("Availability must be AVAILABLE, BUSY or OFFLINE");
  }

  return prisma.driver.update({
    where: { id: driverId },
    data: { availability: availability.toUpperCase() as any },
  });
};

export const driverService = {
  createDriverInDb,
  getAllDriversFromDb,
  updateDriverInDb,
  setAvailabilityInDb,
};
