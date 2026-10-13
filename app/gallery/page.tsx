import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getGalleryImagesAction, GalleryItem } from "@/lib/actions/gallery";
import GalleryClientView from "@/components/GalleryClientView";
import { Loader2, Sparkles, Award, ShieldCheck, Car } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Photo Gallery | Student Passes & Safety Fleet | Four Seasons Driving School Surrey",
  description:
    "View our student ICBC road test passes, certified dual-brake training vehicles, and professional driving lessons across Surrey, Delta, and Langley, BC.",
};

async function GalleryDataWrapper() {
  "use cache";
  const initialImages = await getGalleryImagesAction();
  return <GalleryClientView initialImages={initialImages} />;
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-200/70 bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/60 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>ICBC Student Passes &amp; Certified Safety Fleet</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
                Driving School Photo Gallery
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600">
                Celebrate authentic road test pass moments with our students, explore our modern dual-brake training vehicles, and see real in-car instruction across Surrey, Delta, and Langley.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span>High First-Time Pass Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Dual-Control Inspected Vehicles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-emerald-600" />
                  <span>Surrey &amp; Metro Vancouver Test Routes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Interactive Grid */}
        <section className="py-12 sm:py-20 bg-white border-b border-zinc-200/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-28 text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                  <p className="mt-3 text-xs font-semibold text-zinc-600">Loading photo gallery...</p>
                </div>
              }
            >
              <GalleryDataWrapper />
            </Suspense>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 sm:py-20 bg-zinc-900 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3.5 py-1 rounded-full">
              Your Road Test Success Starts Here
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to be our next road test pass celebration?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of happy drivers who passed their Class 7 &amp; Class 5 ICBC road tests with Four Seasons Driving School. Complimentary doorstep pickup across Surrey, Delta, and Langley.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-xs font-bold text-zinc-950 shadow-md hover:bg-zinc-100 transition"
              >
                <span>Book Your First Lesson Slot</span>
              </Link>
              <Link
                href="/packages"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-7 py-3 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
              >
                <span>Explore Lesson Packages</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
