import config from "@/Config/envCongig";
import { errorResponse } from "@/Utils/res";
import { prisma } from "@/lib/prisma";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { type JwtPayload } from "jsonwebtoken";

const authMiddleWare = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.cookies?.accessToken;
      const bearer = req.headers.authorization;

      if (!token && bearer?.startsWith("Bearer ")) {
        token = bearer.split(" ")[1];
      }

      if (!token) {
        return errorResponse(res, false, httpStatus.UNAUTHORIZED, "No token provided");
      }

      const decoded = jwt.verify(token, config.access_secret as string) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        omit: { password: true },
      });

      if (!user || user.status === "SUSPENDED" || user.deletedAt) {
        return errorResponse(res, false, httpStatus.UNAUTHORIZED, "Unauthorized access");
      }

      req.user = user as any;
      next();
    } catch (error: any) {
      return errorResponse(res, false, httpStatus.UNAUTHORIZED, error?.message || "Failed to authenticate");
    }
  };
};

export default authMiddleWare;
