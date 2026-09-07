import config from "@/Config/envCongig";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import type { IPaymentCreate } from "./payment.interface";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const initiatePaymentInDb = async (customerId: string, customerEmail: string, payload: IPaymentCreate) => {
  const { tripId, method } = payload;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new Error("Trip not found");
  }
  if (trip.patientId !== customerId) {
    throw new Error("You are not authorized to pay for this trip");
  }
  if (trip.status !== "COMPLETED") {
    throw new Error("Trip must be completed before payment");
  }

  const fare = trip.fare ?? 100;
  if (method === "BKASH") {
    throw new Error("Only Stripe payment is supported currently");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { tripId },
  });
  if (existingPayment?.status === "COMPLETED") {
    throw new Error("Payment already completed for this trip");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Ambulance Trip #${trip.id}` },
          unit_amount: Math.round(fare * 100),
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    metadata: { tripId: trip.id, customerId },
    success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/cancel`,
  });

  const payment = existingPayment
    ? await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { transactionId: session.id, status: "PENDING", paidAt: null },
      })
    : await prisma.payment.create({
        data: {
          customerId,
          tripId,
          transactionId: session.id,
          amount: fare,
          method: "STRIPE",
          status: "PENDING",
        },
      });

  return {
    payment,
    sessionId: session.id,
    sessionUrl: session.url,
  };
};

const confirmPaymentInDb = async (payload: Buffer, signature: string) => {
  const webhookSecret = config.stripe_webhook_secret as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tripId = session.metadata?.tripId;

    if (!tripId) {
      throw new Error("Missing tripId in session metadata");
    }

    await prisma.payment.update({
      where: { tripId },
      data: {
        status: "COMPLETED",
        transactionId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    return { received: true, type: event.type };
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tripId = session.metadata?.tripId;

    if (tripId) {
      await prisma.payment.updateMany({
        where: { tripId, transactionId: session.id },
        data: { status: "FAILED" },
      });
    }
    return { received: true, type: event.type };
  }

  return { received: true, type: event.type };
};

const getMyPaymentsFromDb = async (customerId: string) => {
  const payments = await prisma.payment.findMany({
    where: { customerId },
    include: {
      trip: { include: { request: true, ambulance: true, hospital: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return payments;
};

const getPaymentDetailsFromDb = async (paymentId: string, customerId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      trip: { include: { request: true, ambulance: true, hospital: true } },
    },
  });
  if (!payment) {
    throw new Error("Payment not found");
  }
  if (role !== "ADMIN" && payment.customerId !== customerId) {
    throw new Error("You are not authorized to view this payment");
  }
  return payment;
};

export const paymentService = {
  initiatePaymentInDb,
  confirmPaymentInDb,
  getMyPaymentsFromDb,
  getPaymentDetailsFromDb,
};
