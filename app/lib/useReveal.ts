"use client";
import { useEffect, useRef } from "react";

/**
 * Observa todos los [data-reveal] y [data-draw] dentro del elemento ref y
 * añade .is-in cuando entran en el viewport (threshold 0.12, una sola vez).
 * Los stagger delay se controlan con style="--lc-reveal-i:N" en el elemento.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const targets = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal],[data-draw]")
    );
    if (!targets.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
  return ref;
}
