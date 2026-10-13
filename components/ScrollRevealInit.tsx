"use client";

import { useEffect } from "react";

/**
 * High-performance, lightweight ScrollReveal observer.
 * Triggers hardware-accelerated CSS classes (.revealed) when elements enter the viewport.
 * Uses passive IntersectionObserver with disconnect on reveal to consume zero CPU after activation.
 */
export default function ScrollRevealInit() {
  useEffect(() => {
    // If user prefers reduced motion or browser doesn't support IntersectionObserver, auto-reveal
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document
        .querySelectorAll(
          ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale-up"
        )
        .forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Unobserve after revealing to prevent unnecessary CPU cycles
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements = document.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale-up"
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
