import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBookingByIdAction, markBookingPaidAction } from "@/lib/actions/bookings";
import PaymentSuccessClient from "./PaymentSuccessClient";
import { Loader2 } from "lucide-react";

async function PaymentSuccessDataFetcher({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string;
    payment_intent?: string;
    paymentIntentId?: string;
  }>;
}) {
  const params = await searchParams;
  const bookingId = params?.bookingId;
  const paymentIntentId = params?.payment_intent || params?.paymentIntentId;

  let booking = null;

  if (bookingId) {
    try {
      await markBookingPaidAction({
        bookingId,
        paymentIntentId,
        cardLast4: "stripe",
      });
      booking = await getBookingByIdAction(bookingId);
    } catch (err) {
      console.warn("Could not mark booking as paid on success server page:", err);
    }
  }

  return (
    <PaymentSuccessClient
      booking={booking}
      bookingId={bookingId}
      paymentIntentId={paymentIntentId}
    />
  );
}

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string;
    payment_intent?: string;
    paymentIntentId?: string;
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
