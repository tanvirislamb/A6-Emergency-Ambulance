import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import type { IUser } from "../Auth/user.interface";
import { adminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getAllUsersFromDb(req.query);
    response(res, true, httpStatus.OK, "Users retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve users");
  }
};

const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await adminService.changeUserStatusInDb(
      req.params.id as string,
      req.body.status,
      user.id as string,
      user.role as string,
    );
    response(res, true, httpStatus.OK, "User status updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update user status");
  }
};

const changeUserRole = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await adminService.changeUserRoleInDb(
      req.params.id as string,
      req.body.role,
      user.id as string,
      user.role as string,
    );
    response(res, true, httpStatus.OK, "User role updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update user role");
  }
};

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getDashboardStatsFromDb();
    response(res, true, httpStatus.OK, "Dashboard stats retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve dashboard stats");
  }
};

const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getAuditLogsFromDb(req.query);
    response(res, true, httpStatus.OK, "Audit logs retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve audit logs");
  }
};

const getAllTrips = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getAllTripsFromDb(req.query);
    response(res, true, httpStatus.OK, "Trips retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve trips");
  }
};

export const adminController = {
  getAllUsers,
  changeUserStatus,
  changeUserRole,
  getDashboardStats,
  getAuditLogs,
  getAllTrips,
};
