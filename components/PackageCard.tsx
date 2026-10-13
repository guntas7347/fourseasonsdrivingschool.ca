import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PackageItem } from "@/lib/actions/packages";

interface PackageCardProps {
  pkg: PackageItem;
  featured?: boolean;
}

export default function PackageCard({ pkg, featured }: PackageCardProps) {
  const isPopular = Boolean(pkg.popular || featured);

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all ${
        isPopular
          ? "border-2 border-zinc-900 bg-white shadow-xl scale-[1.02] z-10"
          : "border border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 hover:bg-white hover:shadow-md"
      }`}
    >
      {/* Popular Floating Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Most Popular • Best Value</span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isPopular ? "text-emerald-700 font-bold" : "text-zinc-500"
            }`}
          >
            {pkg.duration || `${pkg.lessonsCount} Lesson(s)`}
          </span>
        </div>

        <h3 className="mt-2.5 text-xl font-bold text-zinc-950">{pkg.name}</h3>

        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-zinc-950">{pkg.price}</span>
          <span className="text-xs text-zinc-500 font-medium">CAD</span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-zinc-600 line-clamp-2">
          {pkg.description}
        </p>

        {/* Feature list */}
        {pkg.features && pkg.features.length > 0 && (
          <ul className="mt-6 space-y-2.5 text-xs text-zinc-700 border-t border-zinc-100 pt-5">
            {pkg.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Booking & Buy Actions */}
      <div className="mt-8 pt-4 space-y-2">
        <Link
          href={`/packages/buy?id=${pkg.id}`}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-center text-xs font-semibold transition ${
            isPopular
              ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          }`}
        >
          <span>Buy Package ({pkg.price})</span>
          <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
        </Link>
        <a
          href="/#register"
          className="w-full block py-1 text-center text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          Or book with lesson slot &rarr;
        </a>
      </div>
    </div>
  );
}
