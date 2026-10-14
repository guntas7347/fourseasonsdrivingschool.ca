import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getBookingByIdAction,
  markBookingPaidAction,
} from "@/lib/actions/bookings";
import {
  getPackageOrderByIdAction,
  markPackageOrderPaidAction,
} from "@/lib/actions/packages";
import { stripe } from "@/lib/stripe";
import { connection } from "next/server";
import PaymentSuccessClient from "./PaymentSuccessClient";
import { Loader2 } from "lucide-react";

async function PaymentSuccessDataFetcher({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string;
    type?: string;
    session_id?: string;
    payment_intent?: string;
    payment_intent_id?: string;
  }>;
}) {
  await connection();
  const params = await searchParams;
  let bookingId = params?.bookingId;
  let type: "slot" | "package" =
    params?.type === "package" ? "package" : "slot";
  const sessionId =
    params?.session_id || params?.payment_intent || params?.payment_intent_id;
  let paymentIntentId: string | undefined = undefined;

  let receiptUrl: string | null = null;

  // Retrieve details directly from Stripe Checkout Session or Payment Intent
  if (sessionId) {
    try {
      if (sessionId.startsWith("cs_")) {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["payment_intent", "payment_intent.latest_charge"],
        });

      if (session.payment_intent) {
        const pi =
          typeof session.payment_intent === "object"
            ? (session.payment_intent as any)
            : null;
        paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;

        if (pi?.latest_charge && typeof pi.latest_charge === "object") {
          receiptUrl = pi.latest_charge.receipt_url || null;
        }

        const resolvedBookingId = bookingId || session.metadata?.bookingId;
        const resolvedType = session.metadata?.type || type;
        if (resolvedBookingId && paymentIntentId) {
          stripe.paymentIntents
            .update(paymentIntentId, {
              metadata: {
                bookingId: resolvedBookingId,
                type: resolvedType,
              },
            })
            .catch(() => {});
        }
      } else {
        paymentIntentId = session.id;
      }

      if (!bookingId && session.metadata?.bookingId) {
        bookingId = session.metadata.bookingId;
      }

      if (session.metadata?.type) {
        type = session.metadata.type === "package" ? "package" : "slot";
      }
    } else if (sessionId.startsWith("pi_")) {
      paymentIntentId = sessionId;
    }
  } catch (sessionErr) {
    console.warn("Could not retrieve Stripe payment details:", sessionErr);
  }
}

  // If receiptUrl is not set yet but we have paymentIntentId, retrieve latest_charge
  if (!receiptUrl && paymentIntentId && paymentIntentId.startsWith("pi_")) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge"],
      });
      if (pi.latest_charge && typeof pi.latest_charge === "object") {
        receiptUrl = (pi.latest_charge as any).receipt_url || null;
      }
      if (!bookingId && pi.metadata?.bookingId) {
        bookingId = pi.metadata.bookingId;
      }
      if (pi.metadata?.type) {
        type = pi.metadata.type === "package" ? "package" : "slot";
      }
    } catch {
      // ignore
    }
  }

  let booking = null;
  let order = null;

  if (bookingId) {
    try {
      if (type === "package") {
        await markPackageOrderPaidAction({
          orderId: bookingId,
          paymentIntentId: paymentIntentId || sessionId || "stripe",
          cardLast4: "stripe",
        });
        order = await getPackageOrderByIdAction(bookingId);
      } else {
        await markBookingPaidAction({
          bookingId,
          paymentIntentId: paymentIntentId || sessionId || "stripe",
          cardLast4: "stripe",
        });
        booking = await getBookingByIdAction(bookingId);
      }
    } catch (err) {
      console.warn("Could not mark as paid on success server page:", err);
    }
  }

  return (
    <PaymentSuccessClient
      booking={booking}
      order={order}
      type={type}
      bookingId={bookingId}
      paymentIntentId={paymentIntentId || sessionId}
      receiptUrl={receiptUrl}
    />
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string;
    type?: string;
    session_id?: string;
    payment_intent?: string;
    payment_intent_id?: string;
  }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
              <p className="text-xs font-semibold text-zinc-600">
                Loading receipt...
              </p>
            </div>
          }
        >
          <PaymentSuccessDataFetcher searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
