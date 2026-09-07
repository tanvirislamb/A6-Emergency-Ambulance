import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { hospitalService } from "./hospital.service";

const createHospital = async (req: Request, res: Response) => {
  try {
    const result = await hospitalService.createHospitalInDb(req.body);
    response(res, true, httpStatus.CREATED, "Hospital created successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to create hospital");
  }
};

const getAllHospitals = async (req: Request, res: Response) => {
  try {
    const result = await hospitalService.getAllHospitalsFromDb(req.query);
    response(res, true, httpStatus.OK, "Hospitals retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve hospitals");
  }
};

const updateHospital = async (req: Request, res: Response) => {
  try {
    const result = await hospitalService.updateHospitalInDb(req.params.id as string, req.body);
    response(res, true, httpStatus.OK, "Hospital updated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to update hospital");
  }
};

const deleteHospital = async (req: Request, res: Response) => {
  try {
    const result = await hospitalService.deleteHospitalInDb(req.params.id as string);
    response(res, true, httpStatus.OK, "Hospital deleted successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to delete hospital");
  }
};

export const hospitalController = {
  createHospital,
  getAllHospitals,
  updateHospital,
  deleteHospital,
};
