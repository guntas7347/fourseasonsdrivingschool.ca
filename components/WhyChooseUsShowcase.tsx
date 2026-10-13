"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Car,
  MapPin,
  Clock,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export default function WhyChooseUsShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: "certified",
      number: "01",
      icon: ShieldCheck,
      title: "ICBC Certified Instructors",
      short: "Licensed, bonded & patient coaching for all levels.",
      detail:
        "Every Four Seasons instructor is certified under the BC Motor Vehicle Act. We specialize in patient, calm guidance designed especially for first-time or nervous learners.",
      badge: "Class 4 & 5 Certified",
    },
    {
      id: "dual-brake",
      number: "02",
      icon: Car,
      title: "Dual-Control Safety Fleet",
      short: "Secondary instructor brake pedal for absolute safety.",
      detail:
        "Our clean, modern training cars feature dual foot brakes and wide-angle blind spot mirrors. You are always protected against unexpected road hazards while you build muscle memory.",
      badge: "100% Fleet Equipped",
    },
    {
      id: "routes",
      number: "03",
      icon: MapPin,
      title: "Surrey & Langley Test Route Training",
      short: "Practice where you will actually be evaluated.",
      detail:
        "We rehearse the exact turns, 30 km/h school zones, uncontrolled intersections, and highway merges tested at Surrey 152nd St, Newton, and Langley ICBC licensing offices.",
      badge: "98% Pass Rate",
    },
    {
      id: "doorstep",
      number: "04",
      icon: Clock,
      title: "Free Door-to-Door Pickup",
      short: "We pick you up from home, high school, or work.",
      detail:
        "No need to take transit to your driving lesson. We provide prompt, complimentary pickup and drop-off throughout Surrey, Delta, Langley, and White Rock.",
      badge: "Zero Extra Fees",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      {/* Left: Authentic Photo Showcase with Floating Badges */}
      <div className="lg:col-span-5 relative scroll-reveal-left">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-xl group">
          {/* Main Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
            <Image
              src="/images/instructor-lesson.jpg"
              alt="Four Seasons Driving School instructor coaching student driver in Surrey BC"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority={false}
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
            
            {/* Live Student Quote on photo */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" />
                Live In-Car Coaching
              </span>
              <p className="mt-1.5 text-xs font-medium text-zinc-100 leading-snug">
                &ldquo;Patient guidance that turns road nervousness into calm, instinctual control.&rdquo;
              </p>
            </div>
          </div>

          {/* Floating Pill: Safety Fleet */}
          <div className="absolute top-4 left-4 anim-float-badge z-10 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 shadow-md border border-zinc-100 text-xs font-bold text-zinc-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Dual-Brake Equipped</span>
          </div>

          {/* Floating Pill: High Pass Rate */}
          <div className="absolute top-4 right-4 anim-float-badge-delayed z-10 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 shadow-md border border-zinc-100 text-xs font-bold text-zinc-900">
            <Award className="h-4 w-4 text-amber-500" />
            <span>98% Pass Rate</span>
          </div>
        </div>

        {/* Small reassurance bar below photo */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/80 p-3.5 shadow-xs text-xs text-zinc-700">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">Nervous Drivers Welcomed</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">Class 5 & 7N</span>
        </div>
      </div>

      {/* Right: Interactive Feature Highlights Accordion/Cards */}
      <div className="lg:col-span-7 space-y-3.5 scroll-reveal-right">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          const isSelected = activeFeature === index;

          return (
            <div
              key={feat.id}
              onClick={() => setActiveFeature(index)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                isSelected
                  ? "border-emerald-600 bg-white shadow-md scale-[1.01]"
                  : "border-zinc-200/90 bg-white/60 hover:bg-white hover:border-zinc-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        {feat.number}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                        {feat.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {feat.short}
                    </p>
                  </div>
                </div>

                <span
                  className={`hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {feat.badge}
                </span>
              </div>

              {/* Expanded detail when active */}
              {isSelected && (
                <div className="mt-3.5 pt-3.5 border-t border-zinc-100 text-xs text-zinc-600 leading-relaxed animate-fadeIn">
                  <p>{feat.detail}</p>
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Included in all training packages and single lessons</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
