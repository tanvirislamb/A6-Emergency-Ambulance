import authMiddleWare from "@/Middleware/authMiddleWare";
import { dispatcherMiddleWare, patientMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { dispatchRequestController } from "./dispatchRequest.controller";

const router = Router();

const createRequestSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  patientName: z.string().min(1, "Patient name is required"),
  contact: z.string().min(1, "Contact is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  note: z.string().optional(),
});

router.post("/", authMiddleWare(), patientMiddleWare(), validate(createRequestSchema), dispatchRequestController.createRequest);
router.get("/my", authMiddleWare(), patientMiddleWare(), dispatchRequestController.getMyRequests);
router.get("/search", authMiddleWare(), dispatcherMiddleWare(), dispatchRequestController.searchRequests);
router.get("/:id", authMiddleWare(), patientMiddleWare(), dispatchRequestController.getRequestById);
router.patch("/:id/cancel", authMiddleWare(), patientMiddleWare(), dispatchRequestController.cancelRequest);

export const requestRouter = router;
