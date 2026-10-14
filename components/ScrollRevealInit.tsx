"use client";

import { useEffect } from "react";

/**
 * Bulletproof, lightweight scroll-reveal observer.
 * - Detects elements already in viewport upon page load / refresh at bottom and reveals them instantly.
 * - Uses MutationObserver to instantly capture Suspense-streamed and dynamically added content.
 * - Uses 0 threshold and generous rootMargin so elements reveal naturally before entering viewport.
 * - Guarantees zero stuck content with safety timeouts.
 */
export default function ScrollRevealInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SELECTOR =
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale-up";

    // Reveal all immediately if reduced motion is requested
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    // Check elements immediately against viewport bounding rect
    const revealIfInViewport = (el: Element) => {
      if (el.classList.contains("revealed")) return true;
      const rect = el.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // If the top of the element is within or above the viewport, or partially visible
      if (rect.top <= windowHeight + 60 && rect.bottom >= -50) {
        el.classList.add("revealed");
        return true;
      }
      return false;
    };

    // IntersectionObserver for elements further down the page
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 80px 0px", // triggers 80px before entering viewport
      }
    );

    const observeElement = (el: Element) => {
      if (revealIfInViewport(el)) {
        return;
      }
      observer.observe(el);
    };

    // Initial check of all existing elements
    document.querySelectorAll(SELECTOR).forEach(observeElement);

    // MutationObserver to capture elements mounted by Next.js Suspense or dynamic routes
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.matches(SELECTOR)) {
                observeElement(node);
              }
              node.querySelectorAll?.(SELECTOR).forEach(observeElement);
            }
          });
        }
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Check again on scroll or resize with passive listener
    const handleScrollOrResize = () => {
      document.querySelectorAll(`${SELECTOR}:not(.revealed)`).forEach((el) => {
        if (revealIfInViewport(el)) {
          observer.unobserve(el);
        }
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    // Safety timeout: ensure everything visible is revealed after hydration/scroll restoration
    const t1 = setTimeout(handleScrollOrResize, 350);
    const t2 = setTimeout(handleScrollOrResize, 800);
    // Absolute fallback: after 2s reveal everything so NO card can EVER be hidden
    const t3 = setTimeout(() => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        el.classList.add("revealed");
      });
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
