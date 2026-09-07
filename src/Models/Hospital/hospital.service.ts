import { prisma } from "@/lib/prisma";
import type { IHospital } from "./hospital.interface";

const createHospitalInDb = async (payload: IHospital) => {
  const { name, address, contact, services } = payload;
  return prisma.hospital.create({
    data: { name, address, contact, services: services ?? null },
  });
};

const getAllHospitalsFromDb = async (query: any) => {
  const { search, page = "1", limit = "10" } = query;
  const where: any = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { services: { contains: search, mode: "insensitive" } },
    ];
  }
  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.hospital.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { _count: { select: { trips: true } } },
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.hospital.count({ where });

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

const updateHospitalInDb = async (hospitalId: string, payload: Partial<IHospital>) => {
  const existing = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });
  if (!existing || existing.deletedAt) {
    throw new Error("Hospital not found");
  }

  return prisma.hospital.update({
    where: { id: hospitalId },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.address && { address: payload.address }),
      ...(payload.contact && { contact: payload.contact }),
      ...(payload.services !== undefined && { services: payload.services }),
    },
  });
};

const deleteHospitalInDb = async (hospitalId: string) => {
  const existing = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });
  if (!existing || existing.deletedAt) {
    throw new Error("Hospital not found");
  }
  return prisma.hospital.update({
    where: { id: hospitalId },
    data: { deletedAt: new Date() },
  });
};

export const hospitalService = {
  createHospitalInDb,
  getAllHospitalsFromDb,
  updateHospitalInDb,
  deleteHospitalInDb,
};
