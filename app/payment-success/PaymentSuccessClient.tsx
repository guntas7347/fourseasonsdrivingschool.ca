"use client";

import React from "react";
import Link from "next/link";
import { BookingItem } from "@/lib/actions/bookings";
import { PackageOrderItem } from "@/lib/actions/packages";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  MapPin,
  Printer,
  Home,
  Package as PackageIcon,
  Award,
  Sparkles,
} from "lucide-react";

interface PaymentSuccessClientProps {
  booking?: BookingItem | null;
  order?: PackageOrderItem | null;
  type?: "slot" | "package";
  bookingId?: string;
  paymentIntentId?: string;
}

export default function PaymentSuccessClient({
  booking,
  order,
  type = "slot",
  bookingId,
  paymentIntentId,
}: PaymentSuccessClientProps) {
  const isPackage = type === "package";

  const studentName = isPackage
    ? order
      ? `${order.firstName} ${order.lastName}`.trim()
      : "Valued Student"
    : booking
    ? `${booking.firstName} ${booking.lastName}`.trim()
    : "Valued Student";

  const studentEmail = isPackage ? order?.email : booking?.email;
  const studentPhone = isPackage ? order?.phone : booking?.phone;
  const packageName = isPackage
    ? order?.packageName || "Driving Package"
    : booking?.packageName || "Standard Driving Lesson";
  const finalPaymentId = paymentIntentId || order?.paymentIntentId || booking?.paymentIntentId;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Celebratory Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
        </div>

        <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-zinc-950">
          {isPackage ? "Payment Succeeded & Package Activated!" : "Payment Succeeded & Lesson Confirmed!"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 max-w-md mx-auto">
          {isPackage
            ? "Thank you for choosing Four Seasons Driving School. Your payment has been processed securely via Stripe and your driving package is officially active."
            : "Thank you for choosing Four Seasons Driving School. Your payment has been processed securely via Stripe and your lesson time is locked in."}
        </p>

        {bookingId && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-mono font-bold text-zinc-800">
            <span>{isPackage ? "Package Order ID:" : "Booking ID:"}</span>
            <span className="text-emerald-700">#{bookingId.slice(0, 10).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Official Receipt Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-base font-bold text-zinc-900">
            Official Payment Receipt
          </h2>
          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
            Paid via Stripe
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
              Student Name
            </dt>
            <dd className="font-bold text-zinc-900 text-sm mt-0.5">
              {studentName}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
              Student Contact
            </dt>
            <dd className="font-medium text-zinc-700 text-xs mt-0.5">
              {studentEmail || "Email on file"} {studentPhone ? `(${studentPhone})` : ""}
            </dd>
          </div>

          {isPackage ? (
            <>
              <div>
                <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                  Purchased Package
                </dt>
                <dd className="font-bold text-zinc-900 text-sm mt-0.5 flex items-center gap-1.5">
                  <PackageIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{packageName}</span>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                  Lessons Included
                </dt>
                <dd className="font-semibold text-zinc-800 text-xs mt-0.5">
                  {order?.lessonsCount || 1} Lessons &bull; {order?.duration || "Full course"}
                </dd>
              </div>

              {order?.preferredStartDate && (
                <div>
                  <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                    Preferred Start Date
                  </dt>
                  <dd className="font-medium text-zinc-800 text-xs mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{order.preferredStartDate}</span>
                  </dd>
                </div>
              )}

              <div>
                <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                  License Class
                </dt>
                <dd className="font-medium text-zinc-800 text-xs mt-0.5 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{order?.licenseClass || "Class 7L"}</span>
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                  Lesson Date &amp; Time
                </dt>
                <dd className="font-bold text-zinc-900 text-sm mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{booking ? `${booking.slotDate} (${booking.slotTime})` : "Reserved Slot"}</span>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                  Lesson Type / Package
                </dt>
                <dd className="font-bold text-zinc-900 text-sm mt-0.5">
                  {packageName}
                </dd>
              </div>
            </>
          )}

          {/* Pickup / Location */}
          {((isPackage && order?.city) || (!isPackage && booking?.street)) && (
            <div className="sm:col-span-2">
              <dt className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
                Service Address
              </dt>
              <dd className="text-zinc-700 text-xs mt-0.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>
                  {isPackage
                    ? `${order?.street ? `${order.street}, ` : ""}${order?.city || "Surrey"} ${order?.postCode || ""}`
                    : `${booking?.street}, ${booking?.city} ${booking?.postCode}`}
                </span>
              </dd>
            </div>
          )}

          {/* Payment Intent Reference */}
          {finalPaymentId && (
            <div className="sm:col-span-2 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-zinc-600 uppercase text-[10px] tracking-wider">
                Stripe Payment Intent ID:
              </span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs select-all">
                {finalPaymentId}
              </span>
            </div>
          )}
        </dl>

        {/* Action Buttons */}
        <div className="mt-8 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
            <span>Print Receipt</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition"
          >
            <Home className="h-4 w-4 text-emerald-400" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
