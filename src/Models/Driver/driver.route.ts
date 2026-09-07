import authMiddleWare from "@/Middleware/authMiddleWare";
import { dispatcherMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { driverController } from "./driver.controller";

const router = Router();

const createDriverSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  licenseNo: z.string().min(1, "License number is required"),
  availability: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]).optional(),
});

const updateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  licenseNo: z.string().min(1).optional(),
});

const availabilitySchema = z.object({
  availability: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]),
});

router.post("/", authMiddleWare(), dispatcherMiddleWare(), validate(createDriverSchema), driverController.createDriver);
router.get("/", authMiddleWare(), dispatcherMiddleWare(), driverController.getAllDrivers);
router.patch(
  "/:id",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(updateDriverSchema),
  driverController.updateDriver,
);
router.patch(
  "/:id/availability",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(availabilitySchema),
  driverController.setAvailability,
);

export const driverRouter = router;
