import authMiddleWare from "@/Middleware/authMiddleWare";
import { dispatcherMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { hospitalController } from "./hospital.controller";

const router = Router();

const createHospitalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(1, "Contact is required"),
  services: z.string().optional(),
});

const updateHospitalSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  contact: z.string().min(1).optional(),
  services: z.string().optional(),
});

router.post(
  "/",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(createHospitalSchema),
  hospitalController.createHospital,
);
router.get("/", authMiddleWare(), dispatcherMiddleWare(), hospitalController.getAllHospitals);
router.patch(
  "/:id",
  authMiddleWare(),
  dispatcherMiddleWare(),
  validate(updateHospitalSchema),
  hospitalController.updateHospital,
);
router.delete("/:id", authMiddleWare(), dispatcherMiddleWare(), hospitalController.deleteHospital);

export const hospitalRouter = router;
