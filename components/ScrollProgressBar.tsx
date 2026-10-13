"use client";

import { useEffect, useState } from "react";
import { Car } from "lucide-react";

/**
 * Lightweight scroll progress bar with a mini training car indicator.
 * Hardware accelerated using requestAnimationFrame and CSS transform.
 */
export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const current = (window.scrollY / totalHeight) * 100;
            setProgress(Math.min(100, Math.max(0, current)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200/40 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-75 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Mini car indicator head */}
        {progress > 1 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-emerald-400 shadow-md ring-2 ring-white">
              <Car className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
