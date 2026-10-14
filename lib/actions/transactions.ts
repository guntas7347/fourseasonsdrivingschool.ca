"use server";

import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export type TransactionType = "payment" | "refund";

export type Transaction = {
  id: string; // pi_... or re_...
  type: TransactionType; // "payment" | "refund"
  referenceId: string | null; // For payment: bookingId. For refund: parent paymentIntentId (pi_...)
  referenceType: "booking" | "package" | "payment" | null;
  amount: number; // in cents
  currency: string;
  status: string; // "succeeded", "requires_payment_method", "processing", "canceled", "failed"
  created: number; // unix timestamp seconds
  customer: string | null;
  customerEmail: string | null;
  customerName: string | null;
  description: string | null;
  paymentMethod: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  receiptUrl: string | null;
  refundReason?: string | null;
  refunded: boolean;
  amountRefunded: number;
};

export type TransactionsResult = {
  data: Transaction[];
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  error?: string;
};

function mapPaymentIntent(payment: Stripe.PaymentIntent): Transaction {
  const charge =
    typeof payment.latest_charge === "object" && payment.latest_charge !== null
      ? (payment.latest_charge as Stripe.Charge)
      : null;

  const cardDetails = charge?.payment_method_details?.card;

  const customerEmail =
    payment.receipt_email ||
    charge?.receipt_email ||
    charge?.billing_details?.email ||
    payment.metadata?.customerEmail ||
    null;

  const customerName =
    charge?.billing_details?.name || payment.metadata?.customerName || null;

  let bookingId =
    payment.metadata?.bookingId ||
    payment.metadata?.booking_id ||
    charge?.metadata?.bookingId ||
    charge?.metadata?.booking_id ||
    null;

  const rawType =
    payment.metadata?.type ||
    charge?.metadata?.type ||
    (payment.description?.toLowerCase().includes("package")
      ? "package"
      : "slot");

  // Fallback: extract booking/order ID from description (e.g., #bXCKVHgBZQFW43TFTpK2)
  if (!bookingId) {
    const descText = payment.description || charge?.description || "";
    const match = descText.match(/#([a-zA-Z0-9_-]+)/);
    if (match && match[1] && match[1] !== "direct") {
      bookingId = match[1];
    }
  }

  const referenceType: "booking" | "package" | null =
    rawType === "package" ? "package" : bookingId ? "booking" : null;

  return {
    id: payment.id,
    type: "payment",
    referenceId: bookingId,
    referenceType,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    created: payment.created,
    customer:
      typeof payment.customer === "string"
        ? payment.customer
        : (payment.customer?.id ?? null),
    customerEmail,
    customerName,
    description: payment.description || null,
    paymentMethod:
      typeof payment.payment_method === "string"
        ? payment.payment_method
        : (payment.payment_method?.id ?? null),
    cardBrand: cardDetails?.brand || null,
    cardLast4: cardDetails?.last4 || null,
    receiptUrl: charge?.receipt_url || null,
    refundReason: null,
    refunded: charge ? charge.refunded : false,
    amountRefunded: charge ? charge.amount_refunded : 0,
  };
}

function mapStripeRefund(
  refund: Stripe.Refund,
  parentPayment?: Stripe.PaymentIntent | null,
): Transaction {
  const parentCharge =
    typeof refund.charge === "object" && refund.charge !== null
      ? (refund.charge as Stripe.Charge)
      : null;

  const parentPiId =
    typeof refund.payment_intent === "string"
      ? refund.payment_intent
      : refund.payment_intent?.id || parentPayment?.id || null;

  const customerEmail =
    parentPayment?.receipt_email ||
    parentCharge?.billing_details?.email ||
    parentPayment?.metadata?.customerEmail ||
    null;

  const customerName =
    parentCharge?.billing_details?.name ||
    parentPayment?.metadata?.customerName ||
    null;

  const cardDetails = parentCharge?.payment_method_details?.card;

  return {
    id: refund.id,
    type: "refund",
    referenceId: parentPiId,
    referenceType: "payment",
    amount: refund.amount,
    currency: refund.currency,
    status: refund.status || "succeeded",
    created: refund.created,
    customer: null,
    customerEmail,
    customerName,
    description: refund.reason
      ? `Refund (${refund.reason.replace(/_/g, " ")}) for ${parentPiId || "payment"}`
      : `Refund for ${parentPiId || "payment"}`,
    paymentMethod: "card",
    cardBrand: cardDetails?.brand || null,
    cardLast4: cardDetails?.last4 || null,
    receiptUrl: parentCharge?.receipt_url || null,
    refundReason: refund.reason
      ? refund.reason.replace(/_/g, " ")
      : "Customer requested",
    refunded: true,
    amountRefunded: refund.amount,
  };
}

export async function getTransactions(
  cursor?: string,
  limit = 20,
  beforeCursor?: string,
  searchId?: string,
  statusFilter = "succeeded",
): Promise<TransactionsResult> {
  const safeLimit = Math.min(Math.max(1, limit), 100);

  // 1. If searchId is provided, look up by session, payment intent, or refund directly
  const cleanSearch = searchId?.trim();
  if (cleanSearch) {
    // If it starts with "cs_", search Stripe Checkout Sessions
    if (cleanSearch.startsWith("cs_")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(cleanSearch, {
          expand: [
            "payment_intent",
            "payment_intent.latest_charge",
            "payment_intent.latest_charge.refunds",
          ],
        });

        if (session) {
          const pi = session.payment_intent as Stripe.PaymentIntent | null;
          if (pi) {
            const rows: Transaction[] = [mapPaymentIntent(pi)];
            const charge =
              typeof pi.latest_charge === "object" && pi.latest_charge !== null
                ? (pi.latest_charge as Stripe.Charge)
                : null;

            if (charge?.refunds?.data) {
              for (const ref of charge.refunds.data) {
                rows.push(mapStripeRefund(ref, pi));
              }
            }
            return {
              data: rows,
              hasMore: false,
              nextCursor: null,
              prevCursor: null,
            };
          } else {
            // Standalone session row
            return {
              data: [
                {
                  id: session.id,
                  type: "payment",
                  referenceId: session.metadata?.bookingId || null,
                  referenceType: "booking",
                  amount: session.amount_total || 0,
                  currency: session.currency || "cad",
                  status:
                    session.payment_status === "paid"
                      ? "succeeded"
                      : session.status || "pending",
                  created: session.created,
                  customer:
                    typeof session.customer === "string"
                      ? session.customer
                      : (session.customer?.id ?? null),
                  customerEmail:
                    session.customer_details?.email ||
                    session.metadata?.customerEmail ||
                    null,
                  customerName:
                    session.customer_details?.name ||
                    session.metadata?.customerName ||
                    null,
                  description: `Stripe Checkout Session #${session.id.slice(0, 10)}`,
                  paymentMethod: "card",
                  cardBrand: null,
                  cardLast4: null,
                  receiptUrl: null,
                  refundReason: null,
                  refunded: false,
                  amountRefunded: 0,
                },
              ],
              hasMore: false,
              nextCursor: null,
              prevCursor: null,
            };
          }
        }
      } catch (err: any) {
        console.warn(
          "Could not retrieve Checkout Session with ID:",
          cleanSearch,
        );
      }
    }

    // If it starts with "re_", search Stripe refunds
    if (cleanSearch.startsWith("re_")) {
      try {
        const refund = await stripe.refunds.retrieve(cleanSearch, {
          expand: ["payment_intent", "charge"],
        });
        const parentPi =
          typeof refund.payment_intent === "object" &&
          refund.payment_intent !== null
            ? (refund.payment_intent as Stripe.PaymentIntent)
            : null;

        return {
          data: [mapStripeRefund(refund, parentPi)],
          hasMore: false,
          nextCursor: null,
          prevCursor: null,
        };
      } catch (err: any) {
        console.warn("Could not retrieve refund with ID:", cleanSearch);
      }
    }

    // Search Payment Intent
    const candidateIds = cleanSearch.startsWith("pi_")
      ? [cleanSearch]
      : [cleanSearch, `pi_${cleanSearch}`];

    for (const testId of candidateIds) {
      try {
        const payment = await stripe.paymentIntents.retrieve(testId, {
          expand: ["latest_charge", "latest_charge.refunds"],
        });
        if (payment && payment.id) {
          const rows: Transaction[] = [mapPaymentIntent(payment)];

          const charge =
            typeof payment.latest_charge === "object" &&
            payment.latest_charge !== null
              ? (payment.latest_charge as Stripe.Charge)
              : null;

          if (charge?.refunds?.data && charge.refunds.data.length > 0) {
            for (const ref of charge.refunds.data) {
              rows.push(mapStripeRefund(ref, payment));
            }
          }

          return {
            data: rows,
            hasMore: false,
            nextCursor: null,
            prevCursor: null,
          };
        }
      } catch {
        // Continue to next candidate
      }
    }

    return {
      data: [],
      hasMore: false,
      nextCursor: null,
      prevCursor: null,
      error: `No transaction found with ID "${cleanSearch}"`,
    };
  }

  // 2. Paginated Ledger Listing
  try {
    // If filtering exclusively for refunds:
    if (statusFilter === "refund") {
      const refunds = await stripe.refunds.list({
        limit: safeLimit,
        expand: ["data.payment_intent", "data.charge"],
        ...(cursor ? { starting_after: cursor } : {}),
      });

      const refundRows: Transaction[] = refunds.data.map((ref) => {
        const parentPi =
          typeof ref.payment_intent === "object" && ref.payment_intent !== null
            ? (ref.payment_intent as Stripe.PaymentIntent)
            : null;
        return mapStripeRefund(ref, parentPi);
      });

      return {
        data: refundRows,
        hasMore: refunds.has_more,
        nextCursor: refundRows.at(-1)?.id ?? null,
        prevCursor: refundRows.at(0)?.id ?? null,
      };
    }

    // Standard ledger listing: fetch payment intents with expanded charge & refunds
    const fetchLimit =
      statusFilter === "succeeded"
        ? Math.min(100, Math.max(safeLimit * 2, 40))
        : safeLimit;

    const listParams: Stripe.PaymentIntentListParams = {
      limit: fetchLimit,
      expand: ["data.latest_charge", "data.latest_charge.refunds"],
    };

    if (cursor) {
      listParams.starting_after = cursor;
    } else if (beforeCursor) {
      listParams.ending_before = beforeCursor;
    }

    const paymentsPromise = stripe.paymentIntents.list(listParams);
    const refundsPromise =
      !cursor && !beforeCursor
        ? stripe.refunds
            .list({ limit: 20, expand: ["data.charge"] })
            .catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] });

    const [payments, standaloneRefunds] = await Promise.all([
      paymentsPromise,
      refundsPromise,
    ]);

    const ledgerRows: Transaction[] = [];
    const seenRefundIds = new Set<string>();

    for (const payment of payments.data) {
      const paymentRow = mapPaymentIntent(payment);
      ledgerRows.push(paymentRow);

      const charge =
        typeof payment.latest_charge === "object" &&
        payment.latest_charge !== null
          ? (payment.latest_charge as Stripe.Charge)
          : null;

      if (charge?.refunds?.data) {
        for (const ref of charge.refunds.data) {
          seenRefundIds.add(ref.id);
          ledgerRows.push(mapStripeRefund(ref, payment));
        }
      }
    }

    // Include any standalone refunds not already caught
    if (standaloneRefunds?.data) {
      for (const ref of standaloneRefunds.data) {
        if (!seenRefundIds.has(ref.id)) {
          seenRefundIds.add(ref.id);
          ledgerRows.push(mapStripeRefund(ref));
        }
      }
    }

    // Apply status filter
    let filtered = ledgerRows;
    if (statusFilter === "succeeded") {
      filtered = ledgerRows.filter((item) => item.status === "succeeded");
    } else if (statusFilter === "requires_payment_method") {
      filtered = ledgerRows.filter(
        (item) =>
          item.status === "requires_payment_method" ||
          item.status === "requires_action",
      );
    } else if (statusFilter === "canceled") {
      filtered = ledgerRows.filter((item) => item.status === "canceled");
    }

    // Sort ledger by created timestamp descending
    filtered.sort((a, b) => b.created - a.created);

    const paged = filtered.slice(0, safeLimit);

    return {
      data: paged,
      hasMore: payments.has_more || filtered.length > safeLimit,
      nextCursor:
        payments.data.length > 0
          ? payments.data[payments.data.length - 1].id
          : null,
      prevCursor: payments.data.length > 0 ? payments.data[0].id : null,
    };
  } catch (err: any) {
    console.error("Failed to list Stripe ledger transactions:", err);
    return {
      data: [],
      hasMore: false,
      nextCursor: null,
      prevCursor: null,
      error: err?.message || "Failed to fetch transactions from Stripe",
    };
  }
}

/**
 * Server action to create a Stripe Checkout Session using the modern Elements mode (ui_mode: "elements")
 */
export async function createCheckoutSessionAction({
  amount,
  currency = "cad",
  bookingId,
  type = "slot",
  customerName,
  customerEmail,
  description,
  metadata = {},
}: {
  amount: number | string;
  currency?: string;
  bookingId?: string;
  type?: "slot" | "package";
  customerName?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<{
  success: boolean;
  clientSecret?: string | null;
  sessionId?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  try {
    let amountInCents = 11000;
    if (typeof amount === "number") {
      amountInCents =
        amount > 1000 ? Math.round(amount) : Math.round(amount * 100);
    } else if (typeof amount === "string") {
      const cleaned = parseFloat(amount.replace(/[^0-9.]/g, ""));
      if (!isNaN(cleaned) && cleaned > 0) {
        amountInCents = Math.round(cleaned * 100);
      }
    }

    if (amountInCents < 100) {
      amountInCents = 11000;
    }

    const metadataPayload: Record<string, string> = {
      ...metadata,
      bookingId: bookingId || "",
      type: type || "slot",
    };
    if (customerEmail) metadataPayload.customerEmail = String(customerEmail);
    if (customerName) metadataPayload.customerName = String(customerName);

    const productName =
      description ||
      (type === "package"
        ? `Four Seasons Driving Package #${bookingId || "direct"}`
        : `Four Seasons Driving Lesson #${bookingId || "direct"}`);

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
      mode: "payment",
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: (currency || "cad").toLowerCase(),
            product_data: {
              name: productName,
              description: `Four Seasons Driving School - ${productName}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: metadataPayload,
      payment_intent_data: {
        metadata: metadataPayload,
        description: productName,
      },
      return_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId || ""}&type=${type || "slot"}`,
    });

    return {
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
      amount: amountInCents,
      currency: (currency || "cad").toLowerCase(),
    };
  } catch (err: any) {
    console.error("createCheckoutSessionAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to initialize Stripe Checkout Session",
    };
  }
}
