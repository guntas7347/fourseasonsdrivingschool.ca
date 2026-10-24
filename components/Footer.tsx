import React from "react";
import Link from "next/link";
import { Car, Phone, Mail, MapPin, ShieldCheck, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Brand & Accreditation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-white shadow-sm transition-transform group-hover:scale-105">
                <img src="/images/logo-trans.png" alt="Logo" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                FOUR SEASONS DRIVING SCHOOL
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
              ICBC certified driving school offering top-rated driver training
              in Surrey, Delta, Langley, and surrounding Metro Vancouver
              communities. Patient, defensive, and focused on first-time road
              test success.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Licensed & Bonded under Motor Vehicle Act</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#about"
                  className="hover:text-white transition-colors"
                >
                  About the School
                </Link>
              </li>
              <li>
                <Link
                  href="#packages"
                  className="hover:text-white transition-colors"
                >
                  Training Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/#register"
                  className="hover:text-white transition-colors"
                >
                  Online Registration
                </Link>
              </li>
              <li>
                <Link
                  href="#why-us"
                  className="hover:text-white transition-colors"
                >
                  Why Four Seasons
                </Link>
              </li>
              <li>
                <Link
                  href="#faqs"
                  className="hover:text-white transition-colors"
                >
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-white transition-colors"
                >
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/policy"
                  className="hover:text-white transition-colors"
                >
                  School Policy &amp; Rates
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas Served */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Areas Served
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Surrey (Newton, Guildford, Fleetwood, Cloverdale)</li>
              <li>North Delta & Ladner</li>
              <li>Langley (City & Township)</li>
              <li>White Rock & South Surrey</li>
              <li>Free student pickup & drop-off available</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Contact & Hours
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <a
                  href="tel:+16045053129"
                  className="hover:text-white transition-colors"
                >
                  +1 604-505-3129
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                <a
                  href="mailto:fsdriving84@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  fsdriving84@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>5805 140A Pl, Surrey, BC V3X 2S1, Canada</span>
              </li>
              <li className="flex items-center gap-2.5 text-zinc-400">
                <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Mon – Sun: 7:30 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>&copy; 2026 Four Seasons Driving School. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <Link href="/policy" className="hover:text-zinc-300 transition-colors">
              School Policy &amp; Terms
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="text-center sm:text-right">
            Dual-control certified training vehicles • Serving Surrey & Greater
            Vancouver
          </p>
        </div>
      </div>
    </footer>
  );
}
