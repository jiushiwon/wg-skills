import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { Segment } from "./types";

interface SubtitleProps {
  segments: Segment[];
}

export const Subtitle: React.FC<SubtitleProps> = ({ segments }) => {
  const frame = useCurrentFrame();

  const currentIndex = segments.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 120,
        right: 120,
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {segments.map((segment, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const relativeFrame = frame - segment.startFrame;

        const entranceProgress = interpolate(
          relativeFrame,
          [0, 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
        );

        const opacity = isCurrent
          ? entranceProgress
          : isPast
          ? 0.15
          : 0.25;

        const translateY = isCurrent
          ? interpolate(
              relativeFrame,
              [0, 12],
              [60, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.ease) }
            )
          : isPast
          ? -20
          : 20;

        const scale = isCurrent
          ? interpolate(
              relativeFrame,
              [0, 12],
              [0.85, 1.05],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.2)) }
            )
          : 0.92;

        const floatOffset = isCurrent
          ? interpolate(
              relativeFrame,
              [0, 30],
              [0, -6],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }
            )
          : 0;

        return (
          <div
            key={index}
            style={{
              color: isCurrent ? "#ffffff" : "#a0a8c0",
              fontSize: 72,
              fontWeight: isCurrent ? 800 : 600,
              lineHeight: 1.45,
              textAlign: "center",
              textShadow: isCurrent
                ? "0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(100,150,255,0.15)"
                : "0 2px 8px rgba(0,0,0,0.4)",
              opacity,
              transform: `translateY(${translateY + floatOffset}px) scale(${scale})`,
              transition: "none",
              letterSpacing: isCurrent ? "0.02em" : "0em",
            }}
          >
            {segment.text}
          </div>
        );
      })}
    </div>
  );
};
