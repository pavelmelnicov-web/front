"use client";

import { SituationVideoBackdrop } from "./SituationVideoBackdrop";
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
        <h2>Why people choose this workbook</h2>
      </div>

      <div className="situationsGrid">
        {situations.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);

          const squareClassName = [
            "situationSquare",
            isSelected ? "selected" : "",
            item.id === "new-stage" ? "situationSquare--newStage" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              className={squareClassName}
              key={item.id}
              onClick={() => {
                console.log("[situations] Square toggled", { id: item.id, wasSelected: isSelected });
                onToggle(item.id);
              }}
              type="button"
            >
              <SituationVideoBackdrop seed={index + 1} situationId={item.id} />
              <div className="situationSquareScrim" aria-hidden="true" />

              <div className="situationSquareContent">
                <div className="situationSquareBody">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>

                <SlashWordCycler
                  words={item.examples}
                  intervalMs={2600}
                  startDelayMs={index * 420}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
