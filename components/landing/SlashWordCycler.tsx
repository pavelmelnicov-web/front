"use client";

import { useEffect, useMemo, useState } from "react";

type SlashWordCyclerProps = {
  words: string[];
  intervalMs?: number;
  startDelayMs?: number;
  maxLines?: 2 | 3;
};

function chunkWordsIntoLines(words: string[], maxLines: 2 | 3): string[][] {
  const count = words.length;

  if (count <= 2) {
    return [words];
  }

  if (maxLines === 2) {
    const firstLineCount = Math.ceil(count / 2);
    console.log("[slash-word-cycler] Splitting words into 2 lines", {
      count,
      firstLineCount,
    });
    return [words.slice(0, firstLineCount), words.slice(firstLineCount)];
  }

  if (count === 3) {
    return [words.slice(0, 2), words.slice(2)];
  }

  if (count === 4) {
    return [words.slice(0, 2), words.slice(2)];
  }

  if (count === 5) {
    return [words.slice(0, 2), words.slice(2, 4), words.slice(4)];
  }

  const lineSize = Math.ceil(count / maxLines);
  const rows: string[][] = [];

  for (let index = 0; index < count; index += lineSize) {
    rows.push(words.slice(index, index + lineSize));
  }

  console.log("[slash-word-cycler] Splitting words into up to 3 lines", {
    count,
    lineSize,
    rows: rows.length,
  });

  return rows.slice(0, maxLines);
}

export function SlashWordCycler({
  words,
  intervalMs = 2600,
  startDelayMs = 0,
  maxLines = 3,
}: SlashWordCyclerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const rows = useMemo(() => chunkWordsIntoLines(words, maxLines), [maxLines, words]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      const shouldReduce = media.matches;
      console.log("[slash-word-cycler] Motion preference resolved", { reduceMotion: shouldReduce });
      setReduceMotion(shouldReduce);
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (words.length <= 1 || reduceMotion) {
      console.log("[slash-word-cycler] Cycling disabled", {
        wordsCount: words.length,
        reduceMotion,
      });
      return;
    }

    console.log("[slash-word-cycler] Cycling started", {
      words,
      rows,
      intervalMs,
      startDelayMs,
      maxLines,
    });

    let intervalId = 0;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setActiveIndex((current) => {
          const next = (current + 1) % words.length;
          console.log("[slash-word-cycler] Active word changed", {
            previous: words[current],
            next: words[next],
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
      console.log("[slash-word-cycler] Cycling stopped");
    };
  }, [intervalMs, maxLines, reduceMotion, rows, startDelayMs, words]);

  if (!words.length) {
    console.warn("[slash-word-cycler] No words provided for cycler");
    return null;
  }

  let globalIndex = 0;

  return (
    <div className="situationSlashBlock" aria-live="polite">
      {rows.map((row, rowIndex) => {
        const rowStartIndex = globalIndex;

        const rowContent = row.map((word, wordIndex) => {
          const currentIndex = rowStartIndex + wordIndex;

          return (
            <span className="situationSlashGroup" key={`${word}-${currentIndex}`}>
              {wordIndex > 0 ? <span className="situationSlashDivider">/</span> : null}
              <span
                className={
                  currentIndex === activeIndex
                    ? "situationSlashWord isActive"
                    : "situationSlashWord"
                }
              >
                {word}
              </span>
            </span>
          );
        });

        globalIndex += row.length;

        return (
          <p className="situationSlashLine" key={`slash-row-${rowIndex}`}>
            {rowContent}
          </p>
        );
      })}
    </div>
  );
}
