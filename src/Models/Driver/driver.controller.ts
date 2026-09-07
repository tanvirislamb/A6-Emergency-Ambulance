import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { driverService } from "./driver.service";

const createDriver = async (req: Request, res: Response) => {
  try {
    const result = await driverService.createDriverInDb(req.body);
    response(res, true, httpStatus.CREATED, "Driver created successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to create driver");
  }
};

const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const result = await driverService.getAllDriversFromDb(req.query);
    response(res, true, httpStatus.OK, "Drivers retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve drivers");
  }
};

const updateDriver = async (req: Request, res: Response) => {
  try {
    const result = await driverService.updateDriverInDb(req.params.id as string, req.body);
    response(res, true, httpStatus.OK, "Driver updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update driver");
  }
};

const setAvailability = async (req: Request, res: Response) => {
  try {
    const result = await driverService.setAvailabilityInDb(req.params.id as string, req.body.availability);
    response(res, true, httpStatus.OK, "Driver availability updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update availability");
  }
};

export const driverController = {
  createDriver,
  getAllDrivers,
  updateDriver,
  setAvailability,
};
