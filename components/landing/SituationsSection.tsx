"use client";

import { Check } from "lucide-react";
import { SlashWordCycler } from "./SlashWordCycler";

type SituationItem = {
  id: string;
  title: string;
  description: string;
  examples: string[];
};

type SituationsSectionProps = {
  situations: SituationItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function SituationsSection({
  situations,
  selectedIds,
  onToggle,
}: SituationsSectionProps) {
  return (
    <section className="band situationsBand" id="situations">
      <div className="sectionTitle">
        <p>When it helps</p>
        <h2>Why people choose this workbook</h2>
      </div>

      <div className="situationsGrid">
        {situations.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <button
              className={isSelected ? "situationSquare selected" : "situationSquare"}
              key={item.id}
              onClick={() => {
                console.log("[situations] Square toggled", { id: item.id, wasSelected: isSelected });
                onToggle(item.id);
              }}
              type="button"
            >
              <div className="situationSquareTop">
                <span className="situationSquareCheck" aria-hidden="true">
                  {isSelected ? <Check size={14} /> : null}
                </span>
              </div>

              <div className="situationSquareBody">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </div>

              <SlashWordCycler
                words={item.examples}
                intervalMs={2600}
                startDelayMs={index * 420}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
