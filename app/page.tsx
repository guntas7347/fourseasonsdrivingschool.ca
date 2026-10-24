import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationForm from "@/components/RegistrationForm";
import PackageCard from "@/components/PackageCard";
import GoogleReviews from "@/components/GoogleReviews";
import HeroInteractiveCar from "@/components/HeroInteractiveCar";
import AnimatedStatsCounter from "@/components/AnimatedStatsCounter";
import WhyChooseUsShowcase from "@/components/WhyChooseUsShowcase";
import HomepageGallery from "@/components/HomepageGallery";
import FaqAccordion from "@/components/FaqAccordion";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import HeroTypeAnimation from "@/components/HeroTypeAnimation";
import { getHomepagePackagesAction } from "@/lib/actions/packages";
import { getFaqsAction } from "@/lib/actions/faqs";
import { getGalleryImagesAction } from "@/lib/actions/gallery";
import {
  CalendarCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  PhoneCall,
  CheckCircle2,
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

async function HomepageGalleryList() {
  "use cache";
  const images = await getGalleryImagesAction();
  return <HomepageGallery images={images} />;
}

async function HomepageFaqsList() {
  "use cache";
  const faqs = await getFaqsAction();
  return <FaqAccordion faqs={faqs} />;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Reading/Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION WITH DYNAMIC BACKGROUND & INTERACTIVE CAR */}
        <section
          id="about"
          className="relative overflow-hidden border-b border-zinc-200/70 py-16 sm:py-24"
        >
          {/* Background Photo with Gradient Mask */}
          <div className="absolute inset-0 -z-20 overflow-hidden opacity-35 sm:opacity-40">
            <Image
              src="/images/hero-driving-car.jpg"
              alt="Driving school car on scenic Surrey BC road"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter saturate-110"
            />
            {/* Multi-layered gradient overlay to guarantee text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-zinc-50/95" />
            <div className="absolute inset-0 bg-radial from-transparent via-white/40 to-white/90" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              {/* Prominent Official Brand Logo */}
              <div className="relative mb-6 sm:mb-8 flex justify-center">
                {/* Ambient glow */}
                <div className="absolute -inset-4 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                <div className="relative group inline-flex items-center justify-center rounded-3xl bg-white/90 px-6 py-4 sm:px-10 sm:py-6 shadow-xl shadow-zinc-900/5 border border-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <Image
                    src="/images/logo-trans.png"
                    alt="Four Seasons Driving School"
                    width={380}
                    height={210}
                    priority
                    className="w-52 sm:w-72 md:w-80 h-auto object-contain transition-transform duration-300 group-hover:scale-102"
                  />
                </div>
              </div>

              {/* Top ICBC Badge with Pulsing Radar Beacon */}
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs backdrop-blur-md transition-transform hover:scale-105 duration-200">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  ICBC Licensed Driving School • Surrey &amp; Metro Vancouver
                </span>
                <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Class 5 &amp; 7N
                </span>
              </div>

              {/* Main Headline with High Visual Contrast */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.12]">
                Confident Driving. <br />
                <HeroTypeAnimation />
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-600 max-w-2xl mx-auto">
                One-on-one personalized coaching designed for Class 7L, Class
                7N, and Class 5 drivers. Patient instructors, dual-control
                safety vehicles, and free doorstep pickup across Surrey, Delta,
                Burnaby, Richmond, New Westminster and Langley.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <a
                  href="/#register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  <CalendarCheck className="h-4 w-4 text-emerald-400" />
                  <span>Book Appointment Online</span>
                </a>
                <a
                  href="#packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white/90 px-8 py-4 text-sm font-bold text-zinc-800 shadow-xs transition-all hover:bg-zinc-50 hover:border-zinc-400 hover:-translate-y-0.5 active:scale-95"
                >
                  <span>View Packages &amp; Pricing</span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>
              </div>
            </div>

            {/* INTERACTIVE CAR SIMULATOR CENTERPIECE */}
            <div className="mt-12 sm:mt-16">
              <HeroInteractiveCar />
            </div>

            {/* KEY STATS COUNTER WITH SCROLL-IN ANIMATION */}
            <AnimatedStatsCounter />
          </div>
        </section>

        {/* SECTION DIVIDER: ANIMATED ROAD DASH CONNECTOR */}
        <div className="relative h-6 bg-zinc-100/80 border-b border-zinc-200/60 overflow-hidden flex items-center justify-center">
          <div
            className="w-full h-1 anim-road-h opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #10b981 0px, #10b981 24px, transparent 24px, transparent 52px)",
              backgroundSize: "52px 2px",
            }}
          />
        </div>

        {/* PACKAGES & PRICING SECTION (LIVE FIRESTORE DATA: 3 PACKAGES WITH POPULAR IN CENTER) */}
        <section
          id="packages"
          className="py-20 sm:py-28 bg-white border-b border-zinc-200/70"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto scroll-reveal">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                Transparent Pricing
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Featured Driving Packages
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                Choose the best package suited for your test goals. All packages
                include one-on-one professional coaching with free doorstep
                pickup in Surrey, Delta, and Langley.
              </p>
            </div>

            {/* Exactly 3 packages streamed with popular in center */}
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="mt-3 text-xs font-semibold">
                    Loading live packages...
                  </p>
                </div>
              }
            >
              <HomepagePackagesList />
            </Suspense>

            {/* Explore All Packages CTA button opening dedicated /packages page */}
            <div className="mt-12 text-center scroll-reveal">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-8 py-3.5 text-xs font-bold text-zinc-800 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-400 hover:-translate-y-0.5 active:scale-95"
              >
                <span>Explore All Packages &amp; Pricing</span>
                <ArrowRight className="h-4 w-4 text-zinc-500" />
              </Link>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US / THE FOUR SEASONS ADVANTAGE SHOWCASE */}
        <section
          id="why-us"
          className="py-20 sm:py-28 bg-zinc-50/80 border-b border-zinc-200/70 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 scroll-reveal">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                The Four Seasons Advantage
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Why Students in Surrey Choose Us
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                We focus on cultivating defensive habits that last a lifetime,
                ensuring you feel completely calm and prepared when testing at
                any ICBC driver licensing office.
              </p>
            </div>

            {/* Interactive Photo + Feature Split Component */}
            <WhyChooseUsShowcase />
          </div>
        </section>

        {/* ONLINE REGISTRATION & APPOINTMENT BOOKING (PRIMARY FOCUS) */}
        <section id="register" className="relative scroll-reveal">
          <Suspense
            fallback={
              <div className="py-24 text-center text-zinc-500 font-medium">
                Loading appointment scheduling calendar...
              </div>
            }
          >
            <RegistrationForm />
          </Suspense>
        </section>

        {/* GALLERY SECTION (RECENT STUDENT PASSES & TRAINING FLEET) */}
        <Suspense
          fallback={
            <div className="py-24 text-center text-zinc-400 text-xs font-semibold">
              Loading photo gallery...
            </div>
          }
        >
          <HomepageGalleryList />
        </Suspense>

        {/* GOOGLE REVIEWS TESTIMONIALS (INTEGRATED WITH lib/googleReviews.ts) */}
        <Suspense
          fallback={
            <div className="py-24 text-center text-zinc-400 text-xs font-semibold">
              Loading verified Google reviews...
            </div>
          }
        >
          <GoogleReviews />
        </Suspense>

        {/* FAQS SECTION (LIVE FROM FIRESTORE FAQ CMS) */}
        <section id="faqs" className="py-20 sm:py-24 bg-zinc-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 scroll-reveal">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Got Questions?
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Everything you need to know before your first driving lesson or
                road test.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="mt-2 text-xs font-semibold">
                    Loading questions...
                  </p>
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
