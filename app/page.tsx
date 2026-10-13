import React, { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationForm from "@/components/RegistrationForm";
import PackageCard from "@/components/PackageCard";
import GoogleReviews from "@/components/GoogleReviews";
import { getHomepagePackagesAction } from "@/lib/actions/packages";
import { getFaqsAction } from "@/lib/actions/faqs";
import {
  ShieldCheck,
  Award,
  CheckCircle,
  Car,
  Clock,
  MapPin,
  CalendarCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

async function HomepagePackagesList() {
  "use cache";
  const packages = await getHomepagePackagesAction();
  return (
    <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
      {packages.map((pkg, idx) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          featured={pkg.popular || (packages.length === 3 && idx === 1)}
        />
      ))}
    </div>
  );
}

async function HomepageFaqsList() {
  "use cache";
  const faqs = await getFaqsAction();
  return (
    <div className="mt-10 space-y-4">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-zinc-900 text-sm">
              {faq.question}
            </h3>
            {faq.category && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 shrink-0">
                {faq.category}
              </span>
            )}
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 whitespace-pre-line">
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section
          id="about"
          className="relative overflow-hidden border-b border-zinc-200/70 bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/60 py-20 sm:py-28"
        >
          {/* Subtle background decoration */}
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
            <div className="h-[480px] w-[600px] rounded-full bg-emerald-100/30 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ICBC Licensed Driving School • Surrey &amp; Metro Vancouver</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.12]">
                Confident Driving. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-emerald-700">
                  First-Time Road Test Success.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-zinc-600 max-w-2xl mx-auto">
                Personalized, one-on-one driving instruction designed for Class 7L,
                Class 7N, and Class 5 drivers. Patient instructors, dual-control safety vehicles,
                and free doorstep pickup across Surrey, Delta, and Langley.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <a
                  href="#register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg active:scale-95"
                >
                  <CalendarCheck className="h-4 w-4 text-emerald-400" />
                  <span>Book Appointment Online</span>
                </a>
                <a
                  href="#packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-50 active:scale-95"
                >
                  <span>View Packages &amp; Pricing</span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>
              </div>

              {/* Key Highlights Mini Grid */}
              <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-zinc-200/80 pt-10 text-left">
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950">98%</p>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">ICBC First-Time Pass Rate</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950">5,000+</p>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Confident Drivers Trained</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950">100%</p>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Dual-Brake Safety Vehicles</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950">Free</p>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Door-to-Door Student Pickup</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGES & PRICING SECTION (LIVE FIRESTORE DATA: 3 PACKAGES WITH POPULAR IN CENTER) */}
        <section id="packages" className="py-20 sm:py-28 bg-white border-b border-zinc-200/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Transparent Pricing
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Featured Driving Packages
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                Choose the best package suited for your test goals. All packages include one-on-one professional coaching with free doorstep pickup in Surrey, Delta, and Langley.
              </p>
            </div>

            {/* Exactly 3 packages streamed with popular in center */}
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="mt-3 text-xs font-semibold">Loading live packages...</p>
                </div>
              }
            >
              <HomepagePackagesList />
            </Suspense>

            {/* Explore All Packages CTA button opening dedicated /packages page */}
            <div className="mt-12 text-center">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-xs font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-400 active:scale-95"
              >
                <span>Explore All Packages &amp; Pricing</span>
                <ArrowRight className="h-4 w-4 text-zinc-500" />
              </Link>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US / FEATURES */}
        <section id="why-us" className="py-20 sm:py-28 bg-zinc-50 border-b border-zinc-200/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                The Four Seasons Advantage
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Why Students in Surrey Choose Us
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                We focus on cultivating defensive habits that last a lifetime, ensuring you feel completely calm and prepared when testing at any ICBC driver licensing office.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-900">
                  ICBC Certified Instructors
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                  Licensed and bonded under the BC Motor Vehicle Act. Patient, polite, and skilled in training nervous drivers.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                  <Car className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-900">
                  Dual-Control Fleet
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                  Equipped with secondary instructor brakes and blind-spot mirrors, providing an ultra-safe environment while learning.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-900">
                  Free Doorstep Pickup
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                  We pick you up directly from your home, school, or workplace across Surrey, Delta, Langley, and White Rock.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-900">
                  Realistic Mock Exams
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                  Practice on the exact ICBC test routes around Surrey 152nd St, Surrey 56th Ave, and Langley licensing centers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ONLINE REGISTRATION & APPOINTMENT BOOKING (PRIMARY FOCUS) */}
        <Suspense
          fallback={
            <div className="py-24 text-center text-zinc-500 font-medium">
              Loading appointment scheduling calendar...
            </div>
          }
        >
          <RegistrationForm />
        </Suspense>

        {/* GOOGLE REVIEWS TESTIMONIALS (REALISTIC DATA WITH PICS, DATES, STARS & DIRECT LINKS) */}
        <GoogleReviews />

        {/* FAQS SECTION (LIVE FROM FIRESTORE FAQ CMS) */}
        <section id="faqs" className="py-20 sm:py-24 bg-zinc-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Got Questions?
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Have questions before booking? Here is what most students ask.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="mt-2 text-xs font-semibold">Loading questions...</p>
                </div>
              }
            >
              <HomepageFaqsList />
            </Suspense>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
