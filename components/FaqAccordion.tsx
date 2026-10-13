"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, PhoneCall, Sparkles } from "lucide-react";
import { FaqItem } from "@/lib/actions/faqs";

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(new Set(faqs.map((f) => f.category).filter(Boolean))),
  ];

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((f) => f.category === selectedCategory);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat as string)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Accordion Questions */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen
                  ? "border-zinc-300 bg-white shadow-sm"
                  : "border-zinc-200/90 bg-white/70 hover:bg-white hover:border-zinc-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isOpen
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                    {faq.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {faq.category && (
                    <span className="hidden sm:inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                      {faq.category}
                    </span>
                  )}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-zinc-900 text-white" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Animated Expandable Body */}
              {isOpen && (
                <div className="border-t border-zinc-100 px-5 pt-3 pb-5 text-xs sm:text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reassurance Callout */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-gradient-to-r from-emerald-50/60 via-white to-zinc-50 p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-950">
              Have a specific question about your road test?
            </h4>
            <p className="text-xs text-zinc-600">
              Speak directly with an instructor. We are happy to help you prepare.
            </p>
          </div>
        </div>

        <a
          href="tel:+16045053129"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition active:scale-95 shrink-0"
        >
          <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
          <span>Call +1 (604) 505-3129</span>
        </a>
      </div>
    </div>
  );
}
