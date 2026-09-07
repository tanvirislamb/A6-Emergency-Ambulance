import { errorResponse, response } from "@/Utils/res";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import type { IUser } from "../Auth/user.interface";
import { paymentService } from "./payment.service";

const initiatePayment = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await paymentService.initiatePaymentInDb(user.id as string, user.email as string, req.body);
    response(res, true, httpStatus.OK, "Payment initiated successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to initiate payment");
  }
};

const confirmPayment = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const result = await paymentService.confirmPaymentInDb(req.body, signature);
    response(res, true, httpStatus.OK, "Payment webhook received", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Webhook processing failed");
  }
};

const getMyPayments = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await paymentService.getMyPaymentsFromDb(user.id as string);
    response(res, true, httpStatus.OK, "Payments retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to retrieve payments");
  }
};

const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const result = await paymentService.getPaymentDetailsFromDb(
      req.params.id as string,
      user.id as string,
      user.role as string,
    );
    response(res, true, httpStatus.OK, "Payment retrieved successfully", result);
  } catch (error: any) {
    errorResponse(res, false, httpStatus.NOT_FOUND, error?.message || "Failed to retrieve payment");
  }
};

export const paymentController = {
  initiatePayment,
  confirmPayment,
  getMyPayments,
  getPaymentDetails,
};
