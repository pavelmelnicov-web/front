"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type VariantSearchCyclerProps = {
  queries: string[];
  intervalMs?: number;
  startDelayMs?: number;
};

export function VariantSearchCycler({
  queries,
  intervalMs = 3200,
  startDelayMs = 600,
}: VariantSearchCyclerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      const shouldReduce = media.matches;
      console.log("[variant-search-cycler] Motion preference resolved", {
        reduceMotion: shouldReduce,
      });
      setReduceMotion(shouldReduce);
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (queries.length <= 1 || reduceMotion) {
      console.log("[variant-search-cycler] Cycling disabled", {
        queriesCount: queries.length,
        reduceMotion,
      });
      return;
    }

    console.log("[variant-search-cycler] Cycling started", {
      queries,
      intervalMs,
      startDelayMs,
    });

    let intervalId = 0;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setActiveIndex((current) => {
          const next = (current + 1) % queries.length;
          console.log("[variant-search-cycler] Active query changed", {
            previous: queries[current],
            next: queries[next],
            index: next,
          });
          return next;
        });
      }, intervalMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      console.log("[variant-search-cycler] Cycling stopped");
    };
  }, [intervalMs, queries, reduceMotion, startDelayMs]);

  if (!queries.length) {
    console.warn("[variant-search-cycler] No queries provided for search cycler");
    return null;
  }

  const activeQuery = queries[activeIndex] ?? queries[0];

  return (
    <div className="variantSearchBar" role="search" aria-label="Workbook question preview">
      <Search aria-hidden="true" className="variantSearchIcon" size={11} strokeWidth={1.9} />
      <span className="variantSearchQuery" key={`${activeQuery}-${activeIndex}`} aria-live="polite">
        {activeQuery}
      </span>
    </div>
  );
}
