import Stripe from "stripe";

export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

let stripeInstance: Stripe | null = null;
let cachedKey: string | null = null;

/**
 * Lazily initialize the Stripe instance with runtime secret key.
 * Uses a build-safe fallback key during build time so Docker/CI build step succeeds without secrets.
 */
export const getStripe = (): Stripe => {
  const currentKey =
    process.env.STRIPE_SECRET_KEY || "sk_test_build_time_evaluation_placeholder";

  if (!stripeInstance || cachedKey !== currentKey) {
    cachedKey = currentKey;
    stripeInstance = new Stripe(currentKey, {
      typescript: true,
    });
  }

  return stripeInstance;
};

// Proxied Stripe client for direct use: stripe.checkout, stripe.paymentIntents, etc.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe();
    const val = (instance as any)[prop];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
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
    throw new Error(
      "Amount must be a positive integer in smallest currency unit (e.g. cents)",
    );
  }

  try {
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    };

    if (
      paymentMethod &&
      paymentMethod.startsWith("pm_") &&
      !paymentMethod.includes("mock")
    ) {
      paymentIntentParams.payment_method = paymentMethod;
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);
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
};
