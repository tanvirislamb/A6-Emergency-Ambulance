import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import type { IUser } from "../Auth/user.interface";
import { tripService } from "./trip.service";

const dispatchTrip = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await tripService.dispatchTripInDb(
      req.params.requestId as string,
      user.id as string,
      user.role as string,
      req.body,
    );
    response(res, true, httpStatus.CREATED, "Trip dispatched successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to dispatch trip");
  }
};

const getTripById = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await tripService.getTripByIdFromDb(req.params.id as string, user.id as string, user.role as string);
    response(res, true, httpStatus.OK, "Trip retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.NOT_FOUND, error?.message || "Failed to retrieve trip");
  }
};

const updateTripStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await tripService.updateTripStatusInDb(
      req.params.id as string,
      req.body.status,
      user.id as string,
      user.role as string,
    );
    response(res, true, httpStatus.OK, "Trip status updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update trip status");
  }
};

const assignHospital = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await tripService.assignHospitalInDb(
      req.params.id as string,
      req.body.hospitalId,
      user.id as string,
      user.role as string,
    );
    response(res, true, httpStatus.OK, "Hospital assigned successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to assign hospital");
  }
};

const getMyTrips = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await tripService.getMyTripsFromDb(user.id as string, user.role as string, req.query);
    response(res, true, httpStatus.OK, "Trips retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve trips");
  }
};

export const tripController = {
  dispatchTrip,
  getTripById,
  updateTripStatus,
  assignHospital,
  getMyTrips,
};
