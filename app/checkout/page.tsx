import React, { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StripeCheckout from "@/components/stripeCheckout";
import { db } from "@/lib/firebase/firebase";
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  User,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

async function CheckoutDetails({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  let booking: any = null;

  if (bookingId) {
    try {
      const doc = await db.collection("bookings").doc(bookingId).get();
      if (doc.exists) {
        booking = { id: doc.id, ...doc.data() };
      }
    } catch (err) {
      console.error("Error fetching booking from Firestore:", err);
    }
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg py-20 px-4 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
          <AlertCircle className="h-7 w-7 text-zinc-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950">No Booking Found</h2>
        <p className="text-xs text-zinc-500">
          The requested booking could not be loaded. Please choose an appointment slot from the calendar.
        </p>
        <Link
          href="/#register"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
        >
          <Calendar className="h-4 w-4 text-emerald-400" />
          <span>Select an Appointment Slot</span>
        </Link>
      </div>
    );
  }

  // Parse numeric price for Stripe
  const priceStr = booking.packagePrice || booking.slotTypePrice || "$110";
  const numericPrice = parseFloat(String(priceStr).replace(/[^0-9.]/g, "")) || 110;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb Back */}
      <div className="mb-8">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>&larr; Back to Booking</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              Checkout &amp; Payment
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Complete payment for your driving lesson reservation.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Booking Info & Stripe Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: BOOKING DETAILS FROM FIRESTORE */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Four Seasons Driving School
            </span>
            <h3 className="mt-1 text-lg font-bold text-zinc-950">
              {booking.packageName || booking.slotTypeName || "Driving Lesson"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ref: #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-zinc-700">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-900">Lesson Date</p>
                <p className="text-zinc-600 mt-0.5">{booking.slotDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-900">Appointment Time</p>
                <p className="text-zinc-600 mt-0.5">{booking.slotTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Car className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-900">Vehicle</p>
                <p className="text-zinc-600 mt-0.5">Dual-Control Certified Vehicle</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-900">Student</p>
                <p className="text-zinc-600 mt-0.5">
                  {booking.firstName} {booking.lastName} ({booking.phone})
                </p>
              </div>
            </div>

            {booking.street && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-900">Pickup Location</p>
                  <p className="text-zinc-600 mt-0.5">
                    {booking.street}, {booking.city} {booking.postCode}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-600">
              <span>Lesson Fee</span>
              <span>${numericPrice.toFixed(2)} CAD</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span>Certified ICBC Instructor</span>
              <span className="text-emerald-700 font-medium">Included</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-zinc-200 pt-3 text-sm font-bold text-zinc-950">
              <span>Total Due</span>
              <span className="text-xl font-extrabold text-zinc-950">
                ${numericPrice.toFixed(2)} <span className="text-xs text-zinc-500 font-semibold">CAD</span>
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 space-y-1.5 text-[11px] text-zinc-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Instant slot reservation upon payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Free cancellation up to 24h in advance</span>
            </div>
          </div>
        </div>

        {/* RIGHT: STRIPE PAYMENT COMPONENT */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <CreditCard className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  Card Payment
                </h3>
                <p className="text-xs text-zinc-500">
                  Pay securely with Stripe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-bold text-zinc-600">
              <span className="bg-zinc-100 px-1.5 py-0.5 rounded">VISA</span>
              <span className="bg-zinc-100 px-1.5 py-0.5 rounded">MC</span>
              <span className="bg-zinc-100 px-1.5 py-0.5 rounded">AMEX</span>
            </div>
          </div>

          <StripeCheckout
            bookingId={booking.id}
            amount={numericPrice}
            currency="cad"
            customerName={`${booking.firstName} ${booking.lastName}`.trim()}
            customerEmail={booking.email}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
              <p className="text-xs font-semibold text-zinc-600">Loading checkout...</p>
            </div>
          }
        >
          <CheckoutDetails searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
