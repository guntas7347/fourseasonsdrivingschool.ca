import Stripe from "stripe";
import { randomUUID } from "node:crypto";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Initialize official Stripe server SDK
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true,
});

/**
 * Create a Stripe PaymentIntent for a transaction (in smallest currency unit, e.g. CAD cents)
 */
export const createTransaction = async ({
  amount,
  currency = "cad",
  paymentMethod,
  metadata = {},
}: {
  amount: number; // Smallest currency unit (e.g. cents)
  currency?: string;
  paymentMethod?: string;
  metadata?: Record<string, string>;
}) => {
  if (amount <= 0 || !Number.isInteger(amount)) {
    throw new Error("Amount must be a positive integer in smallest currency unit (e.g. cents)");
  }

  // Use genuine Stripe API if secret key is present
  if (STRIPE_SECRET_KEY) {
    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      };

      if (paymentMethod && paymentMethod.startsWith("pm_") && !paymentMethod.includes("mock")) {
        paymentIntentParams.payment_method = paymentMethod;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      console.log("Stripe PaymentIntent Created:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      });
      return paymentIntent;
    } catch (err: any) {
      console.error("Stripe PaymentIntent Creation Error:", err?.message);
      throw err;
    }
  }

  // Fallback mock object if STRIPE_SECRET_KEY is not configured
  const mockTransaction = {
    id: `pi_mock_${randomUUID().replaceAll("-", "")}`,
    object: "payment_intent",
    amount,
    amount_received: amount,
    currency,
    status: "succeeded",
    payment_method: paymentMethod || "pm_mock_card",
    client_secret: `pi_mock_${randomUUID().replaceAll("-", "")}_secret_mock`,
    livemode: false,
    created: Math.floor(Date.now() / 1000),
    metadata,
  };

  console.log("Fallback Mock Stripe PaymentIntent:", mockTransaction);
  return mockTransaction;
};

/**
 * Initiate a refund on a PaymentIntent via Stripe API
 */
export const initiateRefund = async ({
  paymentIntentId,
  amount,
  reason = "requested_by_customer",
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}) => {
  if (amount !== undefined && (!Number.isInteger(amount) || amount <= 0)) {
    throw new Error("Refund amount must be a positive integer");
  }

  // Use genuine Stripe API if not a mock ID and key exists
  if (STRIPE_SECRET_KEY && !paymentIntentId.startsWith("pi_mock_")) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      });
      console.log("Stripe Refund Processed:", {
        id: refund.id,
        status: refund.status,
        amount: refund.amount,
      });
      return refund;
    } catch (err: any) {
      console.error("Stripe Refund Error:", err?.message);
      throw err;
    }
  }

  // Fallback for mock IDs
  const mockRefund = {
    id: `re_mock_${randomUUID().replaceAll("-", "")}`,
    object: "refund",
    payment_intent: paymentIntentId,
    amount: amount ?? null,
    currency: "cad",
    status: "succeeded",
    reason,
    created: Math.floor(Date.now() / 1000),
    metadata: {},
  };

  console.log("Mock Stripe Refund Processed:", mockRefund);
  return mockRefund;
};
