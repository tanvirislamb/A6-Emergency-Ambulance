import authMiddleWare from "@/Middleware/authMiddleWare";
import { dispatcherMiddleWare, patientMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { tripController } from "./trip.controller";

const router = Router();

const dispatchSchema = z.object({
  ambulanceId: z.string().optional(),
  driverId: z.string().optional(),
  distanceKm: z.number().positive().optional(),
  fare: z.number().positive().optional(),
});

const statusSchema = z.object({
  status: z.enum(["EN_ROUTE", "AT_PICKUP", "TRANSPORTING", "ARRIVED", "COMPLETED", "CANCELLED"]),
});

const hospitalSchema = z.object({
  hospitalId: z.string().min(1, "hospitalId is required"),
});

router.post(
  "/:requestId/dispatch",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(dispatchSchema),
  tripController.dispatchTrip,
);
router.get("/my", authMiddleWare(), patientMiddleWare(), tripController.getMyTrips);
router.get("/:id", authMiddleWare(), patientMiddleWare(), tripController.getTripById);
router.patch(
  "/:id/status",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(statusSchema),
  tripController.updateTripStatus,
);
router.patch(
  "/:id/hospital",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(hospitalSchema),
  tripController.assignHospital,
);

export const tripRouter = router;
