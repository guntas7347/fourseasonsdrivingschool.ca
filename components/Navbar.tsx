"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Calendar, Menu, X, Car, Shield } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToRegistration = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById("register");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <Car className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
              FOUR SEASONS
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              Driving School • Surrey, BC
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#about"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
          >
            About
          </Link>
          <Link
            href="#packages"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
          >
            Packages & Pricing
          </Link>
          <Link
            href="#why-us"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
          >
            Why Choose Us
          </Link>
          <Link
            href="#faqs"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
          >
            FAQs
          </Link>
        </nav>

        {/* CTA Actions */}
        <div className="hidden items-center gap-4 sm:flex">
          <a
            href="tel:+16045550199"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-800 transition-colors hover:text-emerald-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
              <Phone className="h-4 w-4 text-zinc-700" />
            </div>
            <span>(604) 555-0199</span>
          </a>

          <a
            href="#register"
            onClick={scrollToRegistration}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-95"
          >
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span>Book Lessons</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="#register"
            onClick={scrollToRegistration}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
          >
            Book Now
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-50"
            >
              About
            </Link>
            <Link
              href="#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Packages & Pricing
            </Link>
            <Link
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Why Choose Us
            </Link>
            <Link
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-50"
            >
              FAQs
            </Link>
            <div className="mt-2 border-t border-zinc-100 pt-3 flex flex-col gap-3">
              <a
                href="tel:+16045550199"
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-800"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>Call (604) 555-0199</span>
              </a>
              <a
                href="#register"
                onClick={scrollToRegistration}
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-center text-sm font-medium text-white shadow"
              >
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Book Appointment Online</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
