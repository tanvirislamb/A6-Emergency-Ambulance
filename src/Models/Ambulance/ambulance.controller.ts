import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { ambulanceService } from "./ambulance.service";

const createAmbulance = async (req: Request, res: Response) => {
  try {
    const result = await ambulanceService.createAmbulanceInDb(req.body);
    response(res, true, httpStatus.CREATED, "Ambulance created successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to create ambulance");
  }
};

const getAllAmbulances = async (req: Request, res: Response) => {
  try {
    const result = await ambulanceService.getAllAmbulancesFromDb(req.query);
    response(res, true, httpStatus.OK, "Ambulances retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve ambulances");
  }
};

const getAmbulanceById = async (req: Request, res: Response) => {
  try {
    const result = await ambulanceService.getAmbulanceByIdFromDb(req.params.id as string);
    response(res, true, httpStatus.OK, "Ambulance retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.NOT_FOUND, error?.message || "Failed to retrieve ambulance");
  }
};

const updateAmbulance = async (req: Request, res: Response) => {
  try {
    const result = await ambulanceService.updateAmbulanceInDb(req.params.id as string, req.body);
    response(res, true, httpStatus.OK, "Ambulance updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update ambulance");
  }
};

const setAvailability = async (req: Request, res: Response) => {
  try {
    const result = await ambulanceService.setAvailabilityInDb(req.params.id as string, req.body.availability);
    response(res, true, httpStatus.OK, "Ambulance availability updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update availability");
  }
};

const deleteAmbulance = async (req: Request, res: Response) => {
  try {
    const result = await ambulanceService.deleteAmbulanceInDb(req.params.id as string);
    response(res, true, httpStatus.OK, "Ambulance deleted successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to delete ambulance");
  }
};

export const ambulanceController = {
  createAmbulance,
  getAllAmbulances,
  getAmbulanceById,
  updateAmbulance,
  setAvailability,
  deleteAmbulance,
};
