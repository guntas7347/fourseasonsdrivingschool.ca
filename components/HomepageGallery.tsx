"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GalleryItem } from "@/lib/actions/gallery";
import {
  Sparkles,
  MapPin,
  User,
  X,
  Maximize2,
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HomepageGalleryProps {
  images: GalleryItem[];
}

export default function HomepageGallery({ images }: HomepageGalleryProps) {
  // Show the 6 most recent / featured images on the homepage
  const displayImages = images.slice(0, 6);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const activePhoto =
    activeLightboxIndex !== null ? displayImages[activeLightboxIndex] : null;

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-white border-b border-zinc-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-zinc-200/80 scroll-reveal">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <Camera className="h-3.5 w-3.5 text-emerald-600" />
              <span>Student Success &amp; Dual-Brake Fleet</span>
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Driving School Photo Gallery
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-xl">
              See real road test passes, student celebrations, and our certified safety vehicles in action across Surrey, Delta, and Langley.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-400 hover:-translate-y-0.5 transition active:scale-95"
            >
              <span>Explore All {images.length}+ Photos</span>
              <ArrowRight className="h-4 w-4 text-zinc-500" />
            </Link>
          </div>
        </div>

        {/* Gallery Image Grid (6 items) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayImages.map((image, idx) => (
            <div
              key={image.id}
              onClick={() => setActiveLightboxIndex(idx)}
              className="scroll-reveal group relative cursor-pointer overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container with Smooth Zoom */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100">
                <img
                  src={image.url}
                  alt={image.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white text-xs flex items-center gap-1.5 font-medium">
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Click to view full photo</span>
                  </div>
                </div>

                {/* Category & Featured Badge */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-zinc-900/85 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                    {image.category}
                  </span>
                  {image.featured && (
                    <span className="rounded-full bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Caption & Location Details */}
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-zinc-950 group-hover:text-emerald-800 transition line-clamp-1">
                  {image.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  {image.studentName && (
                    <span className="flex items-center gap-1 font-semibold text-zinc-800">
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{image.studentName}</span>
                    </span>
                  )}
                  {image.location && (
                    <span className="flex items-center gap-1 text-zinc-500">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{image.location}</span>
                    </span>
                  )}
                </div>

                {image.description && (
                  <p className="text-xs text-zinc-600 line-clamp-2 pt-1.5 border-t border-zinc-100 italic leading-relaxed">
                    &ldquo;{image.description}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to view all in dedicated gallery */}
        <div className="mt-12 text-center scroll-reveal">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition active:scale-95"
          >
            <span>View All Student Passes &amp; Safety Fleet Photos</span>
            <ArrowRight className="h-4 w-4 text-emerald-400" />
          </Link>
        </div>

      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          onClick={() => setActiveLightboxIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl text-white"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-600/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                  {activePhoto.category}
                </span>
                <span className="text-xs text-zinc-400">
                  {activeLightboxIndex! + 1} of {displayImages.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveLightboxIndex(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lightbox Image Stage with Prev/Next Controls */}
            <div className="relative flex-1 flex items-center justify-center bg-zinc-950/80 p-2 min-h-[300px] max-h-[62vh] overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
              />

              {/* Prev Button */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveLightboxIndex(
                      (prev) =>
                        (prev! - 1 + displayImages.length) % displayImages.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-lg backdrop-blur-xs border border-zinc-700 hover:bg-zinc-800 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Next Button */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveLightboxIndex(
                      (prev) => (prev! + 1) % displayImages.length
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-lg backdrop-blur-xs border border-zinc-700 hover:bg-zinc-800 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Bottom Caption Bar */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-lg text-white">
                  {activePhoto.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  {activePhoto.studentName && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <User className="h-3.5 w-3.5" />
                      <span>{activePhoto.studentName}</span>
                    </span>
                  )}
                  {activePhoto.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{activePhoto.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {activePhoto.description && (
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;{activePhoto.description}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
