"use client";

import React, { useState, useEffect } from "react";
import { GalleryItem } from "@/lib/actions/gallery";
import {
  Sparkles,
  MapPin,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Filter,
} from "lucide-react";

interface GalleryClientViewProps {
  initialImages: GalleryItem[];
}

const CATEGORIES = [
  "All",
  "Student Passes",
  "Training Cars",
  "Lessons & Road Tests",
  "Safety & Dual Control",
];

export default function GalleryClientView({ initialImages }: GalleryClientViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    selectedCategory === "All"
      ? initialImages
      : initialImages.filter((img) => img.category === selectedCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;

      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredImages.length : null
        );
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, filteredImages.length]);

  const activePhoto =
    activeLightboxIndex !== null ? filteredImages[activeLightboxIndex] : null;

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const count =
            cat === "All"
              ? initialImages.length
              : initialImages.filter((i) => i.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setActiveLightboxIndex(null);
              }}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white shadow-md scale-105"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`ml-1.5 text-[10px] font-bold ${
                  selectedCategory === cat ? "text-emerald-400" : "text-zinc-400"
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Photos Masonry/Grid */}
      {filteredImages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center bg-white max-w-md mx-auto">
          <p className="text-sm font-semibold text-zinc-800">No photos in this category yet.</p>
          <p className="mt-1 text-xs text-zinc-500">
            Check back soon or select another category above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredImages.map((image, idx) => (
            <div
              key={image.id}
              onClick={() => setActiveLightboxIndex(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Box */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100">
                <img
                  src={image.url}
                  alt={image.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />

                {/* Gradient Overlay on Hover */}
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
      )}

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          onClick={() => setActiveLightboxIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          {/* Lightbox Container */}
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
                  {activeLightboxIndex! + 1} of {filteredImages.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
                aria-label="Close photo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo Viewport */}
            <div className="relative flex-1 flex items-center justify-center bg-black/80 overflow-hidden min-h-[300px] max-h-[65vh]">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />

              {/* Prev Button */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxIndex(
                        (activeLightboxIndex! - 1 + filteredImages.length) %
                          filteredImages.length
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-xs transition shadow-lg"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxIndex(
                        (activeLightboxIndex! + 1) % filteredImages.length
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-xs transition shadow-lg"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption & Details */}
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 space-y-2">
              <h3 className="text-lg font-bold text-white">{activePhoto.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                {activePhoto.studentName && (
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Student: {activePhoto.studentName}</span>
                  </span>
                )}
                {activePhoto.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{activePhoto.location}</span>
                  </span>
                )}
              </div>
              {activePhoto.description && (
                <p className="text-xs text-zinc-300 italic pt-1 leading-relaxed">
                  &ldquo;{activePhoto.description}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
