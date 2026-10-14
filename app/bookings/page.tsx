"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useForm } from "@/lib/useForm";
import { createBookingAction } from "@/lib/actions/bookings";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  User,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Loader2,
  FileText,
  Sparkles,
  Printer,
  ChevronRight,
  HelpCircle,
  Lock,
} from "lucide-react";

interface BookingPageFormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postCode: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  startDate: string;
  packageOfInterest: string;
  packageName: string;
  packagePrice: string;
  slotId: string;
  slotTime: string;
  slotInstructor: string;
  slotTypeName?: string;
  slotTypePrice?: string;
  alreadyPurchased: "yes" | "no" | "";
  bookedRoadTest: "yes" | "no" | "";
  roadTestDate: string;
  roadTestLocation: string;
  additionalNotes: string;
  // Payment Details
  cardholderName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  paymentMethod: "card" | "pay_on_arrival";
}

const INITIAL_FIELDS: BookingPageFormFields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "Surrey",
  postCode: "",
  licenseNumber: "",
  licenseClass: "Class 7L",
  licenseExpiry: "",
  startDate: "2026-10-16",
  packageOfInterest: "",
  packageName: "10 Lessons Package (Recommended)",
  packagePrice: "$999",
  slotId: "slot-default",
  slotTime: "10:30 AM – 12:00 PM",
  slotInstructor: "",
  slotTypeName: "Standard 90-Min Lesson",
  slotTypePrice: "$110",
  alreadyPurchased: "no",
  bookedRoadTest: "no",
  roadTestDate: "",
  roadTestLocation: "",
  additionalNotes: "",
  cardholderName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  paymentMethod: "card",
};

export default function BookingsCompletionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Using useForm as requested
  const { form, setFormFields, handleChange, setFields } =
    useForm<BookingPageFormFields>(INITIAL_FIELDS);

  // Load half-filled draft from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = sessionStorage.getItem("fourseasons_booking_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormFields({
            ...INITIAL_FIELDS,
            ...parsed,
            slotId: parsed.selectedSlot?.id || "slot-draft",
            slotTime: parsed.selectedSlot?.time || "10:30 AM – 12:00 PM",
            slotInstructor: parsed.selectedSlot?.instructor || "",
            slotTypeName: parsed.slotTypeName || "Standard 90-Min Lesson",
            slotTypePrice: parsed.slotTypePrice || "$110",
            packageName: parsed.packageName || "Driving Lesson Package",
            packagePrice: parsed.packagePrice || "$110",
          });
        } catch (e) {
          console.error("Failed to parse saved draft:", e);
        }
      }
    }
  }, [setFormFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setErrorMessage("Please complete student contact details.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const bookingPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        street: form.street,
        city: form.city,
        postCode: form.postCode,
        licenseNumber: form.licenseNumber,
        licenseClass: form.licenseClass,
        licenseExpiry: form.licenseExpiry,
        packageId: form.packageOfInterest || "pkg-custom",
        packageName: form.packageName,
        packagePrice: form.packagePrice,
        slotId: form.slotId,
        slotDate: form.startDate,
        slotTime: form.slotTime,
        slotInstructor: form.slotInstructor,
        slotTypeName: form.slotTypeName,
        slotTypePrice: form.slotTypePrice,
        alreadyPurchased: form.alreadyPurchased,
        bookedRoadTest: form.bookedRoadTest,
        roadTestDate: form.roadTestDate,
        roadTestLocation: form.roadTestLocation,
        additionalNotes: form.additionalNotes,
        paymentMethod: "card",
        paymentStatus: "pending_payment" as const,
        cardLast4: "stripe",
      };

      console.log("==================================================");
      console.log("FINAL BOOKING SUBMISSION TO SERVER (FIREBASE-ADMIN):");
      console.log(bookingPayload);
      console.log("==================================================");

      const res = await createBookingAction(bookingPayload);

      if (res.success && res.bookingId) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("fourseasons_booking_draft");
          sessionStorage.setItem(
            "fourseasons_checkout_booking",
            JSON.stringify({
              ...bookingPayload,
              id: res.bookingId,
            })
          );
        }

        // Redirect directly to separate checkout page with type=slot
        router.push(`/checkout?bookingId=${res.bookingId}&type=slot`);
        return;
      } else {
        setErrorMessage(res.error || "Failed to process booking reservation.");
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* CONFIRMATION VIEW */}
          {confirmedBookingId ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Celebratory Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-lg text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
                </div>
                <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-zinc-950">
                  Appointment &amp; Lesson Confirmed!
                </h1>
                <p className="mt-2 text-sm text-zinc-600 max-w-md mx-auto">
                  Your lesson slot is officially reserved with Four Seasons Driving School. We have sent a confirmation copy to <strong>{form.email}</strong>.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-mono font-bold text-zinc-800">
                  <span>Booking Reference:</span>
                  <span className="text-emerald-700">#{confirmedBookingId.toUpperCase()}</span>
                </div>
              </div>

              {/* Booking Receipt Summary Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
                  Reservation Receipt Summary
                </h2>

                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Student Name
                    </dt>
                    <dd className="font-bold text-zinc-900 mt-0.5">
                      {form.firstName} {form.lastName}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Phone Number
                    </dt>
                    <dd className="font-semibold text-zinc-800 mt-0.5">{form.phone}</dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Slot Session Type &amp; Rate
                    </dt>
                    <dd className="font-bold text-zinc-900 mt-0.5">
                      {form.slotTypeName || "Standard 90-Min Lesson"} ({form.slotTypePrice || "$110"})
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Selected Package
                    </dt>
                    <dd className="font-bold text-emerald-800 mt-0.5">
                      {form.packageName}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Appointment Time &amp; Date
                    </dt>
                    <dd className="font-bold text-zinc-900 mt-0.5">
                      {form.startDate} • {form.slotTime}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Pickup Address
                    </dt>
                    <dd className="text-zinc-700 mt-0.5">
                      {form.street}, {form.city} {form.postCode}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Training Vehicle
                    </dt>
                    <dd className="text-zinc-700 mt-0.5">Dual-Control Certified Vehicle</dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Driver License
                    </dt>
                    <dd className="text-zinc-700 mt-0.5">
                      {form.licenseClass} ({form.licenseNumber || "LDL pending"})
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Payment Status &amp; Method
                    </dt>
                    <dd className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {form.paymentMethod === "card"
                          ? "Paid Online via Stripe"
                          : "Pay on First Driving Lesson (Cash on Spot)"}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Payment Reference
                    </dt>
                    <dd className="font-mono text-xs text-zinc-800 mt-0.5">
                      {form.paymentMethod === "card"
                        ? "Stripe Verified Electronic Payment"
                        : "Pay on Spot (Cash / In-Person)"}
                    </dd>
                  </div>
                </dl>

                {/* Print & Back buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 pt-6">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
                  >
                    <span>Return to Homepage</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* COMPLETION & PAYMENT FORM VIEW */
            <div className="space-y-8">
              {/* Page Breadcrumb / Back */}
              <Link
                href="/#register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>&larr; Back to Appointment Selector</span>
              </Link>

              {/* Title Header */}
              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  Step 2 of 2: Finalize &amp; Confirm
                </span>
                <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
                  Review Details &amp; Confirm Booking
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Please verify your information, add optional payment details, and confirm your driving lesson slot.
                </p>
              </div>

              {/* Selected Slot & Package Card Banner */}
              <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-zinc-50 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white">
                      <Car className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          {form.slotTypeName ? `Session: ${form.slotTypeName}` : "Lesson Package Selected"}
                        </span>
                        {form.slotTypePrice && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Slot Rate: {form.slotTypePrice}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-zinc-950">{form.packageName}</h2>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-3xl font-black text-zinc-950">{form.slotTypePrice || form.packagePrice}</span>
                    <span className="block text-[11px] text-zinc-500 font-medium">CAD Total</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Date:</strong> {form.startDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Time:</strong> {form.slotTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Car className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Vehicle:</strong> Dual-Control Training Vehicle
                    </span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Complete Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Student Details (Pre-filled from previous step) */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="text-base font-bold text-zinc-900">
                      1. Student &amp; Pickup Details (Pre-filled)
                    </h3>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      ✓ Imported from Homepage
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-semibold text-zinc-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={form.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-xs font-semibold text-zinc-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={form.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-zinc-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-zinc-700">
                        Phone No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="street" className="block text-xs font-semibold text-zinc-700">
                        Pickup Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        required
                        value={form.street}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Driver's License & Road Test Questions */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
                  <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
                    2. ICBC Driver&apos;s License &amp; Road Test Info
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="licenseNumber" className="block text-xs font-semibold text-zinc-700">
                        Driving License No (LDL#)
                      </label>
                      <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={form.licenseNumber}
                        onChange={handleChange}
                        placeholder="7482910"
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="licenseClass" className="block text-xs font-semibold text-zinc-700">
                        License Class
                      </label>
                      <select
                        id="licenseClass"
                        name="licenseClass"
                        value={form.licenseClass}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      >
                        <option value="Class 7L">Class 7L (Learner)</option>
                        <option value="Class 7N">Class 7N (Novice)</option>
                        <option value="Class 5">Class 5 (Full License)</option>
                        <option value="Other">Out of Province / Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="licenseExpiry" className="block text-xs font-semibold text-zinc-700">
                        License Expiry Date
                      </label>
                      <input
                        type="date"
                        id="licenseExpiry"
                        name="licenseExpiry"
                        value={form.licenseExpiry}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Road Test Check */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Have you already booked an ICBC road test?
                    </label>
                    <div className="mt-2 flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                        <input
                          type="radio"
                          name="bookedRoadTest"
                          value="no"
                          checked={form.bookedRoadTest === "no"}
                          onChange={handleChange}
                          className="h-4 w-4 text-zinc-900"
                        />
                        <span>No, not yet</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                        <input
                          type="radio"
                          name="bookedRoadTest"
                          value="yes"
                          checked={form.bookedRoadTest === "yes"}
                          onChange={handleChange}
                          className="h-4 w-4 text-zinc-900"
                        />
                        <span>Yes, road test is booked</span>
                      </label>
                    </div>

                    {form.bookedRoadTest === "yes" && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label htmlFor="roadTestDate" className="block text-xs text-zinc-600">
                            Road Test Date
                          </label>
                          <input
                            type="date"
                            id="roadTestDate"
                            name="roadTestDate"
                            value={form.roadTestDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900"
                          />
                        </div>
                        <div>
                          <label htmlFor="roadTestLocation" className="block text-xs text-zinc-600">
                            ICBC Location (e.g. Surrey 152 St)
                          </label>
                          <input
                            type="text"
                            id="roadTestLocation"
                            name="roadTestLocation"
                            value={form.roadTestLocation}
                            onChange={handleChange}
                            placeholder="Surrey 152nd St"
                            className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. PAYMENT DETAILS */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <span>3. Payment Method</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Lesson appointments are confirmed and locked in via secure Stripe card checkout.
                      </p>
                    </div>

                    <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Stripe 256-Bit SSL</span>
                    </span>
                  </div>

                  {/* Payment Method - Stripe Card Only */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-950">Credit or Debit Card</p>
                        <p className="text-[11px] text-zinc-500">
                          Visa, Mastercard, American Express, Apple Pay, Google Pay
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-emerald-200/60 pt-2 text-[11px] text-zinc-600 flex items-start gap-2">
                      <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Clicking continue will save your reservation and take you to our dedicated Stripe checkout page where you can securely complete your payment. Cash on spot is not accepted.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Submit Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 pt-6">
                  <div className="text-xs text-zinc-500">
                    Next step: Secure card checkout via Stripe.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-9 py-4 text-sm font-bold text-white shadow-md hover:bg-zinc-800 hover:shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Reserving Slot...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-emerald-400" />
                        <span>Continue to Stripe Checkout ({form.packagePrice || "$110"}) →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
