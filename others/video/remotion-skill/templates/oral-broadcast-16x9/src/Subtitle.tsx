import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from "remotion";
import type { Segment } from "./types";

interface SubtitleProps {
  segments: Segment[];
}

export const Subtitle: React.FC<SubtitleProps> = ({ segments }) => {
  const frame = useCurrentFrame();

  const currentIndex = segments.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );
  const currentSeg = segments[currentIndex];

  const segmentProgress = currentSeg
    ? (frame - currentSeg.startFrame) / (currentSeg.endFrame - currentSeg.startFrame)
    : 0;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(segmentProgress * 100)}%`,
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            boxShadow: "0 0 12px rgba(99, 102, 241, 0.6)",
          }}
        />
      </div>

      {currentIndex >= 0 ? (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#ffffff",
              fontWeight: 800,
            }}
          >
            {currentIndex + 1}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600,
              letterSpacing: "0.2em",
            }}
          >
            / {segments.length}
          </div>
        </div>
      ) : null}

      {currentSeg ? (
        <CurrentSubtitle
          text={currentSeg.text}
          relativeFrame={frame - currentSeg.startFrame}
          totalFrames={currentSeg.endFrame - currentSeg.startFrame}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const CurrentSubtitle: React.FC<{
  text: string;
  relativeFrame: number;
  totalFrames: number;
}> = ({ text, relativeFrame, totalFrames }) => {
  const ENTER_DURATION = 18;
  const EXIT_START_FRAME = totalFrames - 20;

  const enterProgress = interpolate(
    relativeFrame,
    [0, ENTER_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.4)),
    }
  );

  const exitProgress = interpolate(
    relativeFrame,
    [EXIT_START_FRAME, totalFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );

  const opacity = enterProgress * (1 - exitProgress);
  const translateY = interpolate(enterProgress, [0, 1], [80, 0]) -
    interpolate(exitProgress, [0, 1], [0, -60]);
  const scale = interpolate(enterProgress, [0, 1], [0.6, 1]) *
    interpolate(exitProgress, [0, 1], [1, 0.85]);

  const breathMid = totalFrames * 0.3;
  const breathEnd = totalFrames * 0.7;
  const breathScale = interpolate(
    relativeFrame,
    [breathMid, breathEnd],
    [1, 1.04],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 180,
      }}
    >
      <div
        style={{
          fontSize: 84,
          color: "#ffffff",
          fontWeight: 800,
          lineHeight: 1.35,
          textAlign: "center",
          letterSpacing: "0.02em",
          padding: "0 200px",
          opacity,
          transform: `translateY(${translateY}px) scale(${scale * breathScale})`,
          textShadow:
            "0 6px 32px rgba(0,0,0,0.85), 0 0 80px rgba(167, 139, 250, 0.45), 0 0 24px rgba(255,255,255,0.2)",
        }}
      >
        {text}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: 320,
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.1)",
          opacity: enterProgress * (1 - exitProgress),
        }}
      >
        <div
          style={{
            width: `${Math.round((relativeFrame / totalFrames) * 100)}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            borderRadius: 2,
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.7)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};