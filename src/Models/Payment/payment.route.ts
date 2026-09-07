import authMiddleWare from "@/Middleware/authMiddleWare";
import { patientMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { paymentController } from "./payment.controller";

const router = Router();

const initiateSchema = z.object({
  tripId: z.string().min(1, "tripId is required"),
  method: z.enum(["STRIPE", "BKASH"]).optional(),
});

router.get("/", authMiddleWare(), patientMiddleWare(), paymentController.getMyPayments);
router.get("/:id", authMiddleWare(), patientMiddleWare(), paymentController.getPaymentDetails);
router.post(
  "/initiate",
  authMiddleWare(),
  patientMiddleWare(),
  validate(initiateSchema),
  paymentController.initiatePayment,
);

export const paymentRouter = router;
