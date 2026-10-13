import React, { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { getPackagesAction } from "@/lib/actions/packages";
import { ShieldCheck, Award, CalendarCheck, PhoneCall, CheckCircle, Loader2 } from "lucide-react";

export const metadata = {
  title: "Driving Lesson Packages & Pricing | Four Seasons Driving School Surrey",
  description:
    "Explore our complete range of ICBC-certified driving packages in Surrey, Delta, and Langley. Single lessons, 5-lesson, 10-lesson packages, and road test car rentals.",
};

async function AllPackagesGrid() {
  "use cache";
  const packages = await getPackagesAction();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative overflow-hidden border-b border-zinc-200/70 bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/60 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ICBC Licensed Driving School Packages</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
                All Driving Lesson Packages &amp; Pricing
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600">
                Choose the training package that fits your experience level and goals. All packages include one-on-one professional coaching in dual-brake safety vehicles and free doorstep pickup across Surrey, Delta, and Langley.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Door-to-door pickup included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Dual-brake safety vehicles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Weekend &amp; evening availability</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Grid with Suspense */}
        <section className="py-16 sm:py-24 bg-white border-b border-zinc-200/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="mt-3 text-xs font-semibold">Loading live packages...</p>
                </div>
              }
            >
              <AllPackagesGrid />
            </Suspense>

            {/* Custom package or question callout */}
            <div className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-2xl text-center md:text-left">
                <h3 className="text-xl font-bold text-zinc-950">
                  Not sure which package is right for you?
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Speak with our certified instructors. We will evaluate your current driving experience and recommend the most cost-effective path to passing your ICBC road test.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link
                  href="/#register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
                >
                  <CalendarCheck className="h-4 w-4 text-emerald-400" />
                  <span>Book Assessment Lesson</span>
                </Link>
                <a
                  href="tel:6047244588"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition"
                >
                  <PhoneCall className="h-4 w-4 text-zinc-500" />
                  <span>Call (604) 724-4588</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
