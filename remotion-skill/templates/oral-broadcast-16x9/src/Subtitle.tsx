import { useCurrentFrame, interpolate } from "remotion";
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
        gap: 24,
      }}
    >
      {segments.map((segment, index) => {
        const isCurrent = index === currentIndex;
        const opacity = isCurrent ? 1 : 0.35;
        const scale = isCurrent
          ? interpolate(
              frame - segment.startFrame,
              [0, 10],
              [0.95, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          : 1;

        return (
          <div
            key={index}
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.4,
              textAlign: "center",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
              opacity,
              transform: `scale(${scale})`,
              transition: "none",
            }}
          >
            {segment.text}
          </div>
        );
      })}
    </div>
  );
};
