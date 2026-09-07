import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json, type Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { adminRouter } from "./Models/Admin/admin.route";
import { ambulanceRouter } from "./Models/Ambulance/ambulance.route";
import { authRouter } from "./Models/Auth/auth.route";
import { requestRouter } from "./Models/DispatchRequest/dispatchRequest.route";
import { driverRouter } from "./Models/Driver/driver.route";
import { hospitalRouter } from "./Models/Hospital/hospital.route";
import { paymentController } from "./Models/Payment/payment.controller";
import { paymentRouter } from "./Models/Payment/payment.route";
import { tripRouter } from "./Models/Trip/trip.route";

const app: Application = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentController.confirmPayment);
app.use(json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/requests", requestRouter);
app.use("/api/ambulances", ambulanceRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/hospitals", hospitalRouter);
app.use("/api/trips", tripRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Emergency Ambulance Dispatch API - MedRush",
  });
});

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err?.message || "Internal server error",
    errors: [],
  });
});

export default app;
