import authMiddleWare from "@/Middleware/authMiddleWare";
import { adminMiddleWare } from "@/Middleware/roleMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { adminController } from "./admin.controller";

const router = Router();

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

const roleSchema = z.object({
  role: z.enum(["PATIENT", "DISPATCHER", "ADMIN"]),
});

router.get("/users", authMiddleWare(), adminMiddleWare(), adminController.getAllUsers);
router.patch(
  "/users/:id/status",
  authMiddleWare(),
  adminMiddleWare(),
  validate(statusSchema),
  adminController.changeUserStatus,
);
router.patch(
  "/users/:id/role",
  authMiddleWare(),
  adminMiddleWare(),
  validate(roleSchema),
  adminController.changeUserRole,
);
router.get("/dashboard-stats", authMiddleWare(), adminMiddleWare(), adminController.getDashboardStats);
router.get("/audit-logs", authMiddleWare(), adminMiddleWare(), adminController.getAuditLogs);
router.get("/trips", authMiddleWare(), adminMiddleWare(), adminController.getAllTrips);

export const adminRouter = router;
