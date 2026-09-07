import type { Response } from "express";

export const response = (res: Response, success: boolean, status: number, message?: string, data?: any) => {
  res.status(status).json({
    success,
    message,
    data,
  });
};

export const errorResponse = (res: Response, success: boolean, status: number, message: string, errors?: any) => {
  res.status(status).json({
    success,
    message,
    errors,
  });
};
