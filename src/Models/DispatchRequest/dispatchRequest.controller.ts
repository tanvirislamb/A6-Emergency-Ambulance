import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import type { IUser } from "../Auth/user.interface";
import { dispatchRequestService } from "./dispatchRequest.service";

const createRequest = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await dispatchRequestService.createRequestInDb(user.id as string, req.body);
    response(res, true, httpStatus.CREATED, "Dispatch request created successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to create request");
  }
};

const getMyRequests = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await dispatchRequestService.getMyRequestsFromDb(user.id as string, req.query);
    response(res, true, httpStatus.OK, "Requests retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve requests");
  }
};

const getRequestById = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await dispatchRequestService.getRequestByIdFromDb(
      req.params.id as string,
      user.id as string,
      user.role as string,
    );
    response(res, true, httpStatus.OK, "Request retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.NOT_FOUND, error?.message || "Failed to retrieve request");
  }
};

const cancelRequest = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await dispatchRequestService.cancelRequestInDb(req.params.id as string, user.id as string);
    response(res, true, httpStatus.OK, "Request cancelled successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to cancel request");
  }
};

const searchRequests = async (req: Request, res: Response) => {
  try {
    const result = await dispatchRequestService.searchRequestsInDb(req.query);
    response(res, true, httpStatus.OK, "Requests retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to search requests");
  }
};

export const dispatchRequestController = {
  createRequest,
  getMyRequests,
  getRequestById,
  cancelRequest,
  searchRequests,
};
