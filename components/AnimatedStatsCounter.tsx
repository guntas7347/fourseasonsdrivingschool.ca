"use client";

import React, { useEffect, useState, useRef } from "react";
import { Award, Users, ShieldCheck, Car } from "lucide-react";

interface StatItemProps {
  label: string;
  sublabel: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
}

function StatCard({ label, sublabel, value, suffix = "", prefix = "", icon }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * value);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(updateCount);
  }, [hasStarted, value]);

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Verified
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-0.5">
          {prefix && <span className="text-2xl font-black text-zinc-950">{prefix}</span>}
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            {count.toLocaleString()}
          </span>
          {suffix && <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{suffix}</span>}
        </div>
        <p className="mt-1 text-xs font-bold text-zinc-900">{label}</p>
        <p className="text-[11px] text-zinc-500">{sublabel}</p>
      </div>

      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function AnimatedStatsCounter() {
  return (
    <div className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
      <StatCard
        value={98}
        suffix="%"
        label="First-Time Pass Rate"
        sublabel="At Surrey & Langley ICBC"
        icon={<Award className="h-5 w-5 text-emerald-600" />}
      />
      <StatCard
        value={5000}
        suffix="+"
        label="Students Licensed"
        sublabel="Safe, confident drivers"
        icon={<Users className="h-5 w-5 text-emerald-600" />}
      />
      <StatCard
        value={100}
        suffix="%"
        label="Dual-Brake Fleet"
        sublabel="Full secondary control"
        icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
      />
      <StatCard
        value={100}
        suffix="%"
        label="Doorstep Pickup"
        sublabel="Surrey, Delta & Langley"
        icon={<Car className="h-5 w-5 text-emerald-600" />}
      />
    </div>
  );
}
