import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ShieldCheck,
  Phone,
  Clock,
  Calendar,
  AlertTriangle,
  CreditCard,
  FileText,
  Users,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "School Policy & Rates | Four Seasons Driving School Surrey BC",
  description:
    "Official driving school policies, lesson fees ($70/hr), road test packages ($200), cancellation rules, ICBC requirements, and pickup surcharges for Four Seasons Driving School.",
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50 to-zinc-100/70 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>ICBC Certified &bull; Licensed under Motor Vehicle Act</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
                School Policy &amp; Terms
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600">
                Please review our official operating guidelines, lesson durations, cancellation terms, and ICBC road test booking policies prior to your scheduled lessons.
              </p>

              {/* Direct Call & Booking CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="tel:+16045053129"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition active:scale-95"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Call 604-505-3129</span>
                </a>
                <Link
                  href="/#packages"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:text-zinc-900 transition"
                >
                  <Car className="h-4 w-4 text-emerald-600" />
                  <span>View Packages &amp; Pricing</span>
                </Link>
              </div>

              {/* Policy & Privacy Tabs */}
              <div className="mt-10 flex items-center justify-center">
                <div className="inline-flex rounded-xl bg-zinc-200/80 p-1 text-xs font-semibold">
                  <span className="rounded-lg bg-white px-4 py-2 text-zinc-950 shadow-xs">
                    School Policy &amp; Rates
                  </span>
                  <Link
                    href="/privacy"
                    className="rounded-lg px-4 py-2 text-zinc-600 hover:text-zinc-950 transition"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Highlights Summary Cards */}
        <section className="py-8 bg-white border-b border-zinc-200/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Standard Rate</p>
                <p className="mt-1 text-xl sm:text-2xl font-extrabold text-zinc-950">$70 <span className="text-xs font-medium text-zinc-500">/ hour</span></p>
                <p className="mt-0.5 text-[11px] text-zinc-500">Min. 55m practice time</p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Road Test Package</p>
                <p className="mt-1 text-xl sm:text-2xl font-extrabold text-emerald-700">$200</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">2h session + 45m warm-up</p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Lesson Cancellation</p>
                <p className="mt-1 text-xl sm:text-2xl font-extrabold text-zinc-950">48 Hours</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">Notice required (or 50% fee)</p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Road Test Notice</p>
                <p className="mt-1 text-xl sm:text-2xl font-extrabold text-zinc-950">72 Hours</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">Required to notify ICBC</p>
              </div>
            </div>
          </div>
        </section>

        {/* Official School Policy Clauses */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="border-b border-zinc-200 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                Official School Policies &amp; Guidelines
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                Governing all driving lessons, vehicle usage, road test sessions, and student registration with Four Seasons Driving School.
              </p>
            </div>

            {/* Clause 1 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  1
                </span>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Fees &amp; Lesson Duration Standards
                  </h3>
                  <div className="space-y-1.5 text-sm leading-relaxed text-zinc-700">
                    <p className="font-semibold text-zinc-900">
                      Standard Training Fee: $70 per hour
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                      <li>Each Driving Lesson is a <strong>minimum of 1 hour</strong>.</li>
                      <li>Each Driving Lesson will have a <strong>minimum of 55 minutes of practice time</strong>.</li>
                      <li>Each Road Test Session is a <strong>minimum of 2 hours</strong> including a 45-minute warm-up.</li>
                      <li>The <strong>Road Test Package is $200</strong>, which includes a 45-minute warm-up lesson before the official ICBC examination and vehicle rental for the test.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* Clause 2 & 2a */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  2
                </span>
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Lesson &amp; Road Test Cancellation Notice
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700">
                    If you wish to cancel a driving lesson or road test, we require <strong>48 hours&apos; notice</strong>; otherwise, a <strong>cancellation fee of 50%</strong> will be assessed.
                  </p>

                  {/* 2a Sub-notice Callout */}
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 space-y-1.5 text-amber-950">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Clause 2a: Road Test Appointment Cancellation (ICBC Requirement)</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-amber-900">
                      For canceling a road test appointment made by Four Seasons Driving School, we require <strong>72 hours&apos; notice</strong>, as we must officially notify ICBC. Failure to give Four Seasons Driving School sufficient notice may result in the student having to pay a <strong>$25 Road Test Cancellation Fee</strong> directly to ICBC.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Clause 3 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  3
                </span>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Payment Timing &amp; Refund Policy
                  </h3>
                  <div className="space-y-1.5 text-sm leading-relaxed text-zinc-700">
                    <p>
                      Payment must be made <strong>before each driving lesson or road test session ends</strong>.
                    </p>
                    <p>
                      There will be <strong>no refund</strong> for driving lessons or road test sessions that have already taken place.
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-600">
                      If the student has pre-paid for driving lessons or a road test session, <strong>no refund will be given</strong> in cases of insufficient notice of cancellation (see clauses 2 and 2a above).
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Clause 4 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  4
                </span>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Valid Driver&apos;s License Presentation
                  </h3>
                  <div className="space-y-1 text-sm leading-relaxed text-zinc-700">
                    <p>
                      Students must provide a valid <strong>BC learner driver&apos;s License (Class 7L)</strong> or <strong>Driver&apos;s License</strong>, including a recognized foreign driver&apos;s license, before the first lesson.
                    </p>
                    <p className="font-semibold text-zinc-900">
                      Students must always physically carry their licenses with them during all in-car training sessions.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Clause 5 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  5
                </span>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Vehicle Occupancy &amp; Observation Rules
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700">
                    There will be a maximum of <strong>3 people (1 observing)</strong> in the Four Seasons Driving School vehicle during the student’s lesson time. This ensures a focused, safe, and professional learning environment compliant with BC Motor Vehicle Act regulations.
                  </p>
                </div>
              </div>
            </article>

            {/* Clause 6 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  6
                </span>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Road Test Booking, Consent &amp; Active Training
                  </h3>
                  <div className="space-y-2 text-sm leading-relaxed text-zinc-700">
                    <p>
                      Road tests can be booked either by the student or by Four Seasons Driving School.
                    </p>
                    <p>
                      The student must sign a <strong>consent and release form</strong> before Four Seasons Driving School may book a road test on their behalf.
                    </p>
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 text-xs sm:text-sm text-zinc-700">
                      <strong>10-Day Active Training Requirement:</strong> Students must be in an active training program, taking driving lessons within <strong>10 days</strong> of a road test booked by Four Seasons Driving School, or Four Seasons Driving School reserves the right to cancel any road test appointments it has made.
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Clause 7 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  7
                </span>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Student Responsibility for Valid License at Training &amp; Test
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700">
                    It is the student&apos;s responsibility to have his/her driver&apos;s license valid at the time of training as well as the road test.
                  </p>
                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-xs sm:text-sm text-red-950">
                    <strong>Important Warning:</strong> If the student cannot provide a valid license at the scheduled time, the student <strong>will not be allowed to drive</strong>, and the <strong>full fees of that training session or road test package will be charged to the student</strong>.
                  </div>
                </div>
              </div>
            </article>

            {/* Clause 8 */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-xs">
                  8
                </span>
                <div className="space-y-3 w-full">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Drop-off &amp; Pick-up Fee Outside Surrey
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700">
                    Four Seasons Driving School provides local service in Surrey. A travel surcharge applies for student pick-up and drop-off outside of Surrey, as detailed below:
                  </p>

                  {/* Surcharge Pricing Grid */}
                  <div className="overflow-hidden rounded-xl border border-zinc-200">
                    <table className="min-w-full divide-y divide-zinc-200 text-left text-xs sm:text-sm">
                      <thead className="bg-zinc-100/80 font-bold text-zinc-900">
                        <tr>
                          <th className="px-4 py-3">Location / Region</th>
                          <th className="px-4 py-3 text-right">Pick-up &amp; Drop-off Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 bg-white font-medium text-zinc-700">
                        <tr className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3">Whalley / Delta</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">$40</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3">Richmond / New Westminster</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">$50</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3">Langley / Coquitlam</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">$50</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3">Burnaby / Vancouver</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">$60</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>

            {/* Need Assistance Card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Have questions about our school policies?
              </h3>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Our certified instructors and administration team are happy to assist you with scheduling, road test requirements, or custom packages.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href="tel:+16045053129"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Call +1 604-505-3129</span>
                </a>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Read Privacy Policy</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
