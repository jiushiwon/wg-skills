import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

interface EndCardProps {
  startFrame: number;
  durationFrames: number;
  message: string;
  hint?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  startFrame,
  durationFrames,
  message,
  hint,
}) => {
  const frame = useCurrentFrame();

  // 仅在 startFrame 之后显示
  const relativeFrame = frame - startFrame;
  if (relativeFrame < 0) return null;

  const intro = interpolate(relativeFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });

  const hintDelay = interpolate(relativeFrame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  return (
    <AbsoluteFill
      style={{
        background: "rgba(10, 10, 20, 0.85)",
        justifyContent: "center",
        alignItems: "center",
        opacity: intro,
      }}
    >
      <div style={{ textAlign: "center", padding: "0 80px" }}>
        <div
          style={{
            fontSize: 28,
            color: "#a78bfa",
            fontWeight: 600,
            letterSpacing: "0.2em",
            marginBottom: 24,
            opacity: hintDelay,
          }}
        >
          ✨ END ✨
        </div>
        <div
          style={{
            fontSize: 84,
            color: "#ffffff",
            fontWeight: 800,
            lineHeight: 1.15,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {message}
        </div>
        {hint ? (
          <div
            style={{
              marginTop: 40,
              fontSize: 36,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              opacity: hintDelay,
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};