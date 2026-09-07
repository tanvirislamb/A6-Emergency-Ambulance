import authMiddleWare from "@/Middleware/authMiddleWare";
import { dispatcherMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { ambulanceController } from "./ambulance.controller";

const router = Router();

const createAmbulanceSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  type: z.string().min(1, "Type is required"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  stationZone: z.string().min(1, "Station zone is required"),
  availability: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]).optional(),
});

const updateAmbulanceSchema = z.object({
  type: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  stationZone: z.string().min(1).optional(),
});

const availabilitySchema = z.object({
  availability: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]),
});

router.post(
  "/",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(createAmbulanceSchema),
  ambulanceController.createAmbulance,
);
router.get("/", authMiddleWare(), dispatcherMiddleWare(), ambulanceController.getAllAmbulances);
router.get("/:id", authMiddleWare(), dispatcherMiddleWare(), ambulanceController.getAmbulanceById);
router.patch(
  "/:id",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(updateAmbulanceSchema),
  ambulanceController.updateAmbulance,
);
router.patch(
  "/:id/availability",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(availabilitySchema),
  ambulanceController.setAvailability,
);
router.delete("/:id", authMiddleWare(), dispatcherMiddleWare(), ambulanceController.deleteAmbulance);

export const ambulanceRouter = router;
