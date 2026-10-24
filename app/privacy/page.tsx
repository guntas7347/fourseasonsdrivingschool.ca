import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Eye,
  FileCheck,
  CreditCard,
  UserCheck,
  Building,
  Mail,
  Phone,
  Clock,
  Car,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Four Seasons Driving School Surrey BC",
  description:
    "Privacy Policy for Four Seasons Driving School. Learn how we collect, use, and protect student driver licenses, contact information, and payment data in compliance with BC PIPA.",
};

export default function PrivacyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50 to-zinc-100/70 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>BC Personal Information Protection Act (PIPA) Compliant</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600">
                Four Seasons Driving School is dedicated to protecting the privacy, confidentiality, and security of our students&apos; personal information and driver records.
              </p>

              {/* Policy & Privacy Tabs */}
              <div className="mt-10 flex items-center justify-center">
                <div className="inline-flex rounded-xl bg-zinc-200/80 p-1 text-xs font-semibold">
                  <Link
                    href="/policy"
                    className="rounded-lg px-4 py-2 text-zinc-600 hover:text-zinc-950 transition"
                  >
                    School Policy &amp; Rates
                  </Link>
                  <span className="rounded-lg bg-white px-4 py-2 text-zinc-950 shadow-xs">
                    Privacy Policy
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs font-medium text-zinc-400">
                Effective Date: {lastUpdated} &bull; Applicable to all enrolled students and website visitors
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">

            {/* 1. Commitment to Privacy */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  1. Our Commitment to Student Privacy
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                Four Seasons Driving School (&quot;we&quot;, &quot;our&quot;, or &quot;the School&quot;) operates an ICBC-certified driver training institution in Surrey, British Columbia. In compliance with British Columbia&apos;s <em>Personal Information Protection Act</em> (PIPA) and Canada&apos;s <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA), this Privacy Policy outlines how we collect, utilize, safeguard, and disclose personal data gathered through our website, online booking portal, and in-car training programs.
              </p>
            </article>

            {/* 2. Information We Collect */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  2. Personal Information We Collect
                </h2>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                To provide safe, certified driving instruction and meet statutory vehicle training regulations, we collect the following student information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-1.5">
                  <span className="font-bold text-zinc-900 block">Contact &amp; Identification</span>
                  <p className="text-zinc-600 leading-relaxed">
                    Student legal first and last name, email address, telephone number, and residential address (for lesson pick-up and drop-off coordination).
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-1.5">
                  <span className="font-bold text-zinc-900 block">Driver&apos;s License Details</span>
                  <p className="text-zinc-600 leading-relaxed">
                    BC Driver&apos;s License or Class 7L Learner&apos;s Permit number, license class, expiration date, or valid foreign driver&apos;s license credentials required before driving.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-1.5">
                  <span className="font-bold text-zinc-900 block">Road Test &amp; Training Records</span>
                  <p className="text-zinc-600 leading-relaxed">
                    Scheduled appointment times, lesson progress evaluations, test center location preferences, and signed ICBC road test consent and release authorization forms.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-1.5">
                  <span className="font-bold text-zinc-900 block">Payment &amp; Transaction Ledger</span>
                  <p className="text-zinc-600 leading-relaxed">
                    Stripe transaction reference IDs, package purchase receipts, payment timestamps, and card type/last-4 digits for receipt generation.
                  </p>
                </div>
              </div>
            </article>

            {/* 3. Purpose & How We Use Data */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  3. How We Use Your Information
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-zinc-600 leading-relaxed list-disc pl-5">
                <li>
                  <strong>Statutory Driving Verification:</strong> Verifying that each student possesses a valid BC learner&apos;s permit or license prior to operating dual-control certified training vehicles, in accordance with the BC Motor Vehicle Act.
                </li>
                <li>
                  <strong>Lesson Coordination &amp; Logistics:</strong> Scheduling appointments, planning pick-up and drop-off routes in Surrey and neighbouring municipalities, and sending reminder notifications.
                </li>
                <li>
                  <strong>Road Test Booking on Student&apos;s Behalf:</strong> Submitting student details to ICBC test booking centers when authorized by a signed consent and release agreement.
                </li>
                <li>
                  <strong>Payment &amp; Invoicing:</strong> Processing lesson fees, packages, and issuing official payment receipts.
                </li>
                <li>
                  <strong>Safety &amp; Customer Support:</strong> Addressing student inquiries, verifying instructor availability, and maintaining student progress records.
                </li>
              </ul>
            </article>

            {/* 4. Payment Security & Stripe */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  4. Payment Processing &amp; Financial Security
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                All credit and debit card payments conducted via our website are processed directly through <strong>Stripe, Inc.</strong>, a certified PCI-DSS Level 1 Service Provider.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs sm:text-sm text-emerald-950">
                <strong>Zero Card Storage Policy:</strong> Four Seasons Driving School never stores, views, or logs full credit card numbers, expiry dates, or CVV security codes on our servers. All financial transactions are tokenized and encrypted end-to-end through Stripe Checkout.
              </div>
            </article>

            {/* 5. Disclosure & ICBC Sharing */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Building className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  5. Information Sharing &amp; Third Parties
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                We respect your personal information and do not sell, rent, or trade student records under any circumstance. Information is only shared under the following conditions:
              </p>
              <ul className="space-y-1.5 text-sm text-zinc-600 leading-relaxed list-disc pl-5">
                <li>
                  <strong>ICBC (Insurance Corporation of British Columbia):</strong> Strictly when booking road tests on your behalf with your explicit signed consent, or during mandatory regulatory compliance audits.
                </li>
                <li>
                  <strong>Certified Instructors:</strong> Providing assigned instructors with your name, phone number, pick-up address, and learning goals for the scheduled lesson.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If compelled by law enforcement, subpoena, court order, or Motor Vehicle Act regulatory inspectors.
                </li>
              </ul>
            </article>

            {/* 6. Vehicle Safety & Cameras */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Car className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  6. In-Car Safety &amp; Training Observation
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                Per Section 5 of our School Policy, vehicle occupancy during student training is limited to a maximum of 3 individuals (with up to 1 observer for instructor evaluation or student peer review). Forward-facing dash cameras installed in school vehicles are utilized strictly for road safety, collision prevention, and insurance verification, and are not disseminated publicly.
              </p>
            </article>

            {/* 7. Student Rights & Retention */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  7. Data Retention &amp; Student Rights
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                Under BC PIPA, students have the right to request access to their personal information held in our records, verify its accuracy, and request corrections. Student training records are retained for the period mandated by BC driving school regulatory guidelines, after which they are securely archived or purged.
              </p>
            </article>

            {/* 8. Contacting our Privacy Officer */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                  8. Privacy Inquiries &amp; Contact Information
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">
                If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is managed, please contact our school administration:
              </p>
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-2 text-xs sm:text-sm text-zinc-700">
                <p className="font-bold text-zinc-950">Four Seasons Driving School</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <a href="tel:+16045053129" className="font-semibold text-zinc-900 hover:text-emerald-700 transition">
                    +1 604-505-3129
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                  <a href="mailto:fsdriving84@gmail.com" className="font-semibold text-zinc-900 hover:text-emerald-700 transition">
                    fsdriving84@gmail.com
                  </a>
                </p>
                <p className="text-zinc-500">
                  Location: 5805 140A Pl, Surrey, BC V3X 2S1, Canada
                </p>
              </div>
            </article>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
