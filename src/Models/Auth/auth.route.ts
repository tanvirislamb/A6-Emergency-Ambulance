import authMiddleWare from "@/Middleware/authMiddleWare";
import { validate } from "@/Utils/validate";
import { Router } from "express";
import { z } from "zod";
import { authController } from "./auth.controller";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: z.enum(["PATIENT", "DISPATCHER"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const socialSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().optional(),
  picture: z.string().optional(),
});

router.post("/register", validate(registerSchema), authController.registerUser);
router.post("/login", validate(loginSchema), authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.post("/social", validate(socialSchema), authController.socialLogin);
router.post("/logout", authController.logout);
router.get("/me", authMiddleWare(), authController.getMe);

export const authRouter = router;
