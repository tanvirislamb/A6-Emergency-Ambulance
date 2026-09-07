import { errorResponse } from "@/Utils/res";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return errorResponse(res, false, httpStatus.BAD_REQUEST, "Validation failed", errors);
    }
    req.body = result.data;
    next();
  };
};
