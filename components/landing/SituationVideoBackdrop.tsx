"use client";

import { useEffect, useRef } from "react";

type SituationVideoBackdropProps = {
  seed?: number;
  situationId?: string;
};

type SituationBackdropTone = "move" | "self" | "renovation" | "budget";

function paintFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  time: number,
  animated: boolean,
) {
  context.clearRect(0, 0, width, height);

  const driftX = animated ? Math.sin(time * 0.00042 + seed * 1.7) * width * 0.14 : 0;
  const driftY = animated ? Math.cos(time * 0.00036 + seed * 2.1) * height * 0.12 : 0;
  const driftX2 = animated ? Math.cos(time * 0.0003 + seed * 1.2) * width * 0.1 : 0;
  const driftY2 = animated ? Math.sin(time * 0.00038 + seed * 0.8) * height * 0.11 : 0;
  const driftX3 = animated ? Math.sin(time * 0.00024 + seed * 0.5) * width * 0.08 : 0;
  const driftY3 = animated ? Math.cos(time * 0.00027 + seed * 1.5) * height * 0.09 : 0;

  const blobOne = context.createRadialGradient(
    width * (0.28 + seed * 0.02) + driftX,
    height * 0.3 + driftY,
    0,
    width * (0.28 + seed * 0.02) + driftX,
    height * 0.3 + driftY,
    width * 0.62,
  );
  blobOne.addColorStop(0, "rgba(17, 17, 16, 0.30)");
  blobOne.addColorStop(0.55, "rgba(17, 17, 16, 0.10)");
  blobOne.addColorStop(1, "rgba(17, 17, 16, 0)");
  context.fillStyle = blobOne;
  context.fillRect(0, 0, width, height);

  const blobTwo = context.createRadialGradient(
    width * 0.74 + driftX2,
    height * 0.7 + driftY2,
    0,
    width * 0.74 + driftX2,
    height * 0.7 + driftY2,
    width * 0.54,
  );
  blobTwo.addColorStop(0, "rgba(17, 17, 16, 0.26)");
  blobTwo.addColorStop(0.6, "rgba(17, 17, 16, 0.09)");
  blobTwo.addColorStop(1, "rgba(17, 17, 16, 0)");
  context.fillStyle = blobTwo;
  context.fillRect(0, 0, width, height);

  const blobThree = context.createRadialGradient(
    width * 0.5 + driftX3,
    height * 0.5 + driftY3,
    0,
    width * 0.5 + driftX3,
    height * 0.5 + driftY3,
    width * 0.4,
  );
  blobThree.addColorStop(0, "rgba(17, 17, 16, 0.22)");
  blobThree.addColorStop(0.65, "rgba(17, 17, 16, 0.08)");
  blobThree.addColorStop(1, "rgba(17, 17, 16, 0)");
  context.fillStyle = blobThree;
  context.fillRect(0, 0, width, height);
}

function getSituationBackdropTone(situationId: string | undefined, seed: number): SituationBackdropTone {
  if (situationId === "new-stage") {
    return "move";
  }

  if (situationId === "self-expression") {
    return "self";
  }

  if (situationId === "renovation-fear") {
    return "renovation";
  }

  if (situationId === "no-designer-budget") {
    return "budget";
  }

  const tones: SituationBackdropTone[] = ["move", "self", "renovation", "budget"];
  return tones[seed % tones.length];
}

export function SituationVideoBackdrop({ seed = 0, situationId }: SituationVideoBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const variant = (seed % 3) + 1;
  const tone = getSituationBackdropTone(situationId, seed);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("[situation-video-backdrop] Canvas ref is not available");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("[situation-video-backdrop] Canvas 2D context is unavailable");
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(rect.width * deviceRatio));
      const nextHeight = Math.max(1, Math.round(rect.height * deviceRatio));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
        console.log("[situation-video-backdrop] Canvas resized", {
          seed,
          width: rect.width,
          height: rect.height,
          deviceRatio,
        });
      }

      return {
        width: rect.width,
        height: rect.height,
      };
    };

    const render = (time: number, animated: boolean) => {
      const { width, height } = resizeCanvas();
      if (width <= 0 || height <= 0) {
        console.warn("[situation-video-backdrop] Canvas has zero size, skipping frame", { seed, width, height });
        if (animated) {
          animationFrame = window.requestAnimationFrame((nextTime) => render(nextTime, true));
        }
        return;
      }

      paintFrame(context, width, height, seed, time, animated);

      if (animated) {
        animationFrame = window.requestAnimationFrame((nextTime) => render(nextTime, true));
      }
    };

    const applyMotionPreference = () => {
      window.cancelAnimationFrame(animationFrame);

      if (media.matches) {
        render(0, false);
        console.log("[situation-video-backdrop] Reduced motion enabled", { seed });
        return;
      }

      console.log("[situation-video-backdrop] Animated backdrop started", { seed });
      animationFrame = window.requestAnimationFrame((time) => render(time, true));
    };

    resizeObserver = new ResizeObserver(() => {
      if (media.matches) {
        render(0, false);
        return;
      }

      console.log("[situation-video-backdrop] Resize observer triggered repaint", { seed });
    });

    resizeObserver.observe(canvas);
    applyMotionPreference();
    media.addEventListener("change", applyMotionPreference);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      media.removeEventListener("change", applyMotionPreference);
      console.log("[situation-video-backdrop] Backdrop cleanup completed", { seed });
    };
  }, [seed]);

  return (
    <div
      className={`situationSquareBackdropWrap situationSquareBackdropWrap--v${variant} situationSquareBackdropWrap--${tone}`}
      aria-hidden="true"
      data-situation-backdrop="true"
    >
      <span className="situationSquareBlob situationSquareBlob--one" />
      <span className="situationSquareBlob situationSquareBlob--two" />
      <span className="situationSquareBlob situationSquareBlob--three" />
      <canvas className="situationSquareBackdrop" ref={canvasRef} />
      <div className="situationPhotoScene">
        <span className="situationPhotoLayer situationPhotoLayer--back" />
        <span className="situationPhotoLayer situationPhotoLayer--middle" />
        <span className="situationPhotoLayer situationPhotoLayer--front" />
        <span className="situationPhotoStreak situationPhotoStreak--one" />
        <span className="situationPhotoStreak situationPhotoStreak--two" />
        <span className="situationPhotoStreak situationPhotoStreak--three" />
      </div>
      <div className="situationVisualStage">
        <span className="situationVisualLine situationVisualLine--one" />
        <span className="situationVisualLine situationVisualLine--two" />
        <span className="situationVisualOrb situationVisualOrb--one" />
        <span className="situationVisualOrb situationVisualOrb--two" />
        <span className="situationVisualOrb situationVisualOrb--three" />
        <span className="situationVisualCard situationVisualCard--one" />
        <span className="situationVisualCard situationVisualCard--two" />
        <span className="situationVisualCard situationVisualCard--three" />
      </div>
      <div className="situationSquareGrain" />
    </div>
  );
}
