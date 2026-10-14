import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBookingByIdAction, markBookingPaidAction } from "@/lib/actions/bookings";
import { getPackageOrderByIdAction, markPackageOrderPaidAction } from "@/lib/actions/packages";
import { stripe } from "@/lib/stripe";
import PaymentSuccessClient from "./PaymentSuccessClient";
import { Loader2 } from "lucide-react";

async function PaymentSuccessDataFetcher({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string;
    type?: string;
    session_id?: string;
  }>;
}) {
  const params = await searchParams;
  let bookingId = params?.bookingId;
  let type: "slot" | "package" = params?.type === "package" ? "package" : "slot";
  const sessionId = params?.session_id;
  let paymentIntentId: string | undefined = undefined;

  // Retrieve details directly from Stripe Checkout Session
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });

      if (session.payment_intent) {
        paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;

        const resolvedBookingId = bookingId || session.metadata?.bookingId;
        const resolvedType = session.metadata?.type || type;
        if (resolvedBookingId && paymentIntentId) {
          stripe.paymentIntents.update(paymentIntentId, {
            metadata: {
              bookingId: resolvedBookingId,
              type: resolvedType,
            },
          }).catch(() => {});
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
    } catch (sessionErr) {
      console.warn("Could not retrieve Stripe Checkout session:", sessionErr);
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
    />
  );
}

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string;
    type?: string;
    session_id?: string;
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
              <p className="text-xs font-semibold text-zinc-600">Loading receipt...</p>
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
