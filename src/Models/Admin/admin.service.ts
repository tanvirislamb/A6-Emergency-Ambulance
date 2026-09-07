import { prisma } from "@/lib/prisma";

const getAllUsersFromDb = async (query: any) => {
  const { role, status, search, page = "1", limit = "10" } = query;
  const where: any = { deletedAt: null };
  if (role) where.role = role.toUpperCase();
  if (status) where.status = status.toUpperCase();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.user.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.user.count({ where });

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

const changeUserStatusInDb = async (userId: string, status: string, actorId: string, actorRole: string) => {
  if (userId === actorId) {
    throw new Error("You cannot change your own status");
  }
  if (!["ACTIVE", "SUSPENDED"].includes(status.toUpperCase())) {
    throw new Error("Status must be ACTIVE or SUSPENDED");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { status: status.toUpperCase() as any },
      omit: { password: true },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as any,
        action: `USER_STATUS_${status.toUpperCase()}`,
        entity: "User",
        entityId: userId,
        meta: { from: user.status, to: status.toUpperCase() },
      },
    });
    return updated;
  });

  return result;
};

const changeUserRoleInDb = async (userId: string, role: string, actorId: string, actorRole: string) => {
  if (userId === actorId) {
    throw new Error("You cannot change your own role");
  }
  if (!["PATIENT", "DISPATCHER", "ADMIN"].includes(role.toUpperCase())) {
    throw new Error("Role must be PATIENT, DISPATCHER or ADMIN");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() as any },
      omit: { password: true },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as any,
        action: "USER_ROLE_CHANGE",
        entity: "User",
        entityId: userId,
        meta: { from: user.role, to: role.toUpperCase() },
      },
    });
    return updated;
  });

  return result;
};

const getDashboardStatsFromDb = async () => {
  const [
    totalUsers,
    totalPatients,
    totalDispatchers,
    totalAdmins,
    totalAmbulances,
    availableAmbulances,
    totalDrivers,
    availableDrivers,
    totalHospitals,
    totalRequests,
    pendingRequests,
    totalTrips,
    activeTrips,
    completedTrips,
    totalRevenue,
    priorityBreakdown,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, role: "PATIENT" } }),
    prisma.user.count({ where: { deletedAt: null, role: "DISPATCHER" } }),
    prisma.user.count({ where: { deletedAt: null, role: "ADMIN" } }),
    prisma.ambulance.count({ where: { deletedAt: null } }),
    prisma.ambulance.count({
      where: { deletedAt: null, availability: "AVAILABLE" },
    }),
    prisma.driver.count({ where: { deletedAt: null } }),
    prisma.driver.count({
      where: { deletedAt: null, availability: "AVAILABLE" },
    }),
    prisma.hospital.count({ where: { deletedAt: null } }),
    prisma.dispatchRequest.count(),
    prisma.dispatchRequest.count({ where: { status: "PENDING" } }),
    prisma.trip.count(),
    prisma.trip.count({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    }),
    prisma.trip.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.dispatchRequest.groupBy({
      by: ["priority"],
      _count: { _all: true },
    }),
  ]);

  return {
    users: { totalUsers, totalPatients, totalDispatchers, totalAdmins },
    fleet: {
      totalAmbulances,
      availableAmbulances,
      totalDrivers,
      availableDrivers,
      totalHospitals,
    },
    operations: {
      totalRequests,
      pendingRequests,
      totalTrips,
      activeTrips,
      completedTrips,
    },
    revenue: totalRevenue._sum.amount || 0,
    priorityBreakdown,
  };
};

const getAuditLogsFromDb = async (query: any) => {
  const { entity, action, page = "1", limit = "10" } = query;
  const where: any = {};
  if (entity) where.entity = entity;
  if (action) where.action = action;

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.auditLog.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: { user: { omit: { password: true } } },
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.auditLog.count({ where });

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

const getAllTripsFromDb = async (query: any) => {
  const { status, page = "1", limit = "10" } = query;
  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const data = await prisma.trip.findMany({
    where,
    skip,
    take: Number.parseInt(limit),
    include: {
      request: true,
      ambulance: true,
      driver: true,
      hospital: true,
      payment: true,
    },
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

export const adminService = {
  getAllUsersFromDb,
  changeUserStatusInDb,
  changeUserRoleInDb,
  getDashboardStatsFromDb,
  getAuditLogsFromDb,
  getAllTripsFromDb,
};
