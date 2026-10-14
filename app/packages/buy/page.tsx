"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useForm } from "@/lib/useForm";
import { getPackagesAction, purchasePackageAction, PackageItem } from "@/lib/actions/packages";
import {
  CheckCircle2,
  Package,
  CreditCard,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Printer,
  Sparkles,
  Award,
  Lock,
} from "lucide-react";

interface PackagePurchaseFormFields {
  packageId: string;
  packageName: string;
  packagePrice: string;
  firstName: string;
  lastName: string;
  email: string; // Most important
  phone: string; // Most important
  street: string;
  city: string;
  postCode: string;
  licenseNumber: string;
  licenseClass: string;
  preferredStartDate: string;
  additionalNotes: string;
  cardholderName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  paymentMethod: "card" | "pay_on_arrival";
}

const DEFAULT_PURCHASE_FIELDS: PackagePurchaseFormFields = {
  packageId: "",
  packageName: "",
  packagePrice: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "Surrey",
  postCode: "",
  licenseNumber: "",
  licenseClass: "Class 7L",
  preferredStartDate: "2026-10-18",
  additionalNotes: "",
  cardholderName: "",
  cardNumber: "•••• •••• •••• 4242",
  cardExpiry: "12/28",
  cardCvc: "888",
  paymentMethod: "card",
};

function PackagePurchaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPkgId = searchParams.get("id");

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useForm as required
  const { form, setFormFields, handleChange, setFields } =
    useForm<PackagePurchaseFormFields>(DEFAULT_PURCHASE_FIELDS);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const all = await getPackagesAction();
        setPackages(all);

        let chosen = all.find((p) => p.id === requestedPkgId);
        if (!chosen) {
          chosen = all.find((p) => p.popular) || all[0];
        }

        if (chosen) {
          setSelectedPackage(chosen);
          setFields({
            packageId: chosen.id,
            packageName: chosen.name,
            packagePrice: chosen.price,
          });
        }
      } catch (err) {
        console.error("Failed to load packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requestedPkgId]);

  const handleSelectPackageChange = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setSelectedPackage(pkg);
      setFields({
        packageId: pkg.id,
        packageName: pkg.name,
        packagePrice: pkg.price,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.phone) {
      setErrorMessage("Email address and contact phone number are essential for order confirmation and instructor coordination.");
      return;
    }

    if (!form.firstName || !form.lastName) {
      setErrorMessage("Please enter student's first and last name.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await purchasePackageAction({
        packageId: selectedPackage?.id || form.packageId || "pkg-custom",
        packageName: selectedPackage?.name || form.packageName,
        packagePrice: selectedPackage?.price || form.packagePrice,
        numericPrice: selectedPackage?.numericPrice,
        duration: selectedPackage?.duration,
        lessonsCount: selectedPackage?.lessonsCount,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        street: form.street,
        city: form.city,
        postCode: form.postCode,
        licenseNumber: form.licenseNumber,
        licenseClass: form.licenseClass,
        preferredStartDate: form.preferredStartDate,
        additionalNotes: form.additionalNotes,
        paymentMethod: "card",
        paymentStatus: "pending_payment",
      });

      if (res.success && res.orderId) {
        // Redirect directly to Stripe checkout page with type=package
        router.push(`/checkout?bookingId=${res.orderId}&type=package`);
        return;
      } else {
        setErrorMessage(res.error || "Failed to process package purchase.");
      }
    } catch (err: any) {
      console.error("Purchase submission error:", err);
      setErrorMessage(err?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedOrderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment &amp; Registration Successful
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-zinc-950 sm:text-4xl">
            Driving Package Confirmed!
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 max-w-xl mx-auto">
            Thank you, <span className="font-semibold text-zinc-900">{form.firstName}</span>!
            We have confirmed your purchase of <span className="font-semibold text-zinc-900">{selectedPackage?.name}</span>.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-xs text-zinc-700">
            <span>Order Reference:</span>
            <span className="font-bold text-zinc-900">{confirmedOrderId}</span>
          </div>

          {/* Email notice callout */}
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 max-w-lg mx-auto flex items-start gap-3 text-left">
            <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Confirmation Email Dispatched</p>
              <p className="mt-0.5 text-blue-800">
                A formal receipt and lesson roadmap have been sent to <strong>{form.email}</strong>.
                Our instructor will call your contact number (<strong>{form.phone}</strong>) within 24 hours to schedule your first lesson!
              </p>
            </div>
          </div>

          {/* Details Summary */}
          <div className="mt-8 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 text-left space-y-3 text-xs text-zinc-700 max-w-lg mx-auto">
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500">Package</span>
              <span className="font-bold text-zinc-900">{selectedPackage?.name}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500">Total Price</span>
              <span className="font-extrabold text-zinc-950 text-sm">{selectedPackage?.price} CAD</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500">Duration / Lessons</span>
              <span className="font-medium">{selectedPackage?.duration} ({selectedPackage?.lessonsCount} Lessons)</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500">Pickup Location</span>
              <span className="font-medium">{form.city}, BC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Status</span>
              <span className="font-semibold text-emerald-700">Paid in Full</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Order Receipt</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition"
            >
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Back button */}
      <Link
        href="/packages"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Packages Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Package Selection & Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Selected Driving Package
            </span>

            {/* Package Selector */}
            <div className="mt-4">
              <label htmlFor="packageSelect" className="block text-xs font-semibold text-zinc-700 mb-1">
                Choose or Change Package:
              </label>
              <select
                id="packageSelect"
                value={selectedPackage?.id || ""}
                onChange={(e) => handleSelectPackageChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — {pkg.price}
                  </option>
                ))}
              </select>
            </div>

            {selectedPackage && (
              <div className="mt-5 border-t border-zinc-100 pt-5">
                <h3 className="text-xl font-extrabold text-zinc-950">{selectedPackage.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-zinc-950">{selectedPackage.price}</span>
                  <span className="text-xs text-zinc-500 font-medium">CAD (Taxes included)</span>
                </div>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  {selectedPackage.description}
                </p>

                {selectedPackage.features && selectedPackage.features.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-700">
                    {selectedPackage.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 space-y-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Four Seasons Guarantee</span>
            </div>
            <p>
              Includes free door-to-door pickup across Surrey, Delta, and Langley. ICBC certified dual-brake vehicles provided.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Purchase Form (Asking for Basic Details, Email & Contact Phone) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                Student &amp; Billing Information
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Please provide your contact details so we can email your purchase receipt and schedule your pickup.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* HIGHLIGHTED CONTACT BOX (MOST IMPORTANT AS REQUESTED) */}
            <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/30 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Primary Contact Details (Most Important)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-zinc-950">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      className="block w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Your official purchase receipt and lesson confirmation will be sent here.
                  </p>
                </div>

                {/* Contact Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-zinc-950">
                    Phone / Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(604) 505-3129"
                      className="block w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Used by the instructor to coordinate lesson pickups.
                  </p>
                </div>
              </div>
            </div>

            {/* BASIC DETAILS: Student Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-zinc-900">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Gurpreet"
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-zinc-900">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Singh"
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Address & City for Doorstep Pickup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="street" className="block text-xs font-semibold text-zinc-900">
                  Street Address (Pickup Location)
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="e.g. 14280 72 Ave"
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-zinc-900">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="Surrey">Surrey</option>
                  <option value="Delta">Delta</option>
                  <option value="Langley">Langley</option>
                  <option value="White Rock">White Rock</option>
                  <option value="Other">Other (Metro Vancouver)</option>
                </select>
              </div>
            </div>

            {/* License details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="licenseClass" className="block text-xs font-semibold text-zinc-900">
                  Current License Class
                </label>
                <select
                  id="licenseClass"
                  name="licenseClass"
                  value={form.licenseClass}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="Class 7L">Class 7L (Learner)</option>
                  <option value="Class 7N">Class 7N (Novice)</option>
                  <option value="Class 5">Class 5 (Full / Foreign)</option>
                </select>
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-xs font-semibold text-zinc-900">
                  BC Driver&apos;s License # (Optional)
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g. 7483921"
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Details - Stripe Only, No Cash */}
            <div className="border-t border-zinc-200/80 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Payment Method
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Stripe Elements
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Credit or Debit Card</p>
                    <p className="text-[11px] text-zinc-500">
                      Visa, Mastercard, AMEX, Apple Pay, Google Pay
                    </p>
                  </div>
                </div>

                <div className="border-t border-emerald-200/60 pt-2 text-[11px] text-zinc-600 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Package payments are securely processed online via Stripe Elements. Cash on arrival is not available for package bundles.
                  </span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-zinc-800 transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                )}
                <span>
                  {submitting
                    ? "Initializing Stripe Checkout..."
                    : `Continue to Payment (${selectedPackage?.price || "$110"} CAD) →`}
                </span>
              </button>
              <p className="mt-2 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3 text-zinc-400" />
                <span>256-bit SSL encrypted checkout powered by Stripe</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PackagePurchasePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-2 text-xs font-medium">Loading package checkout...</p>
            </div>
          }
        >
          <PackagePurchaseContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
