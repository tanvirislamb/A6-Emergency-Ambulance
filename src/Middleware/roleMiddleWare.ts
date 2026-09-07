import { errorResponse } from "@/Utils/res";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return errorResponse(res, false, httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    if (!roles.includes(user.role as string)) {
      return errorResponse(res, false, httpStatus.FORBIDDEN, "Forbidden: insufficient permissions");
    }

    next();
  };
};

export const adminMiddleWare = () => restrictTo("ADMIN");
export const dispatcherMiddleWare = () => restrictTo("DISPATCHER", "ADMIN");
export const patientMiddleWare = () => restrictTo("PATIENT", "DISPATCHER", "ADMIN");
