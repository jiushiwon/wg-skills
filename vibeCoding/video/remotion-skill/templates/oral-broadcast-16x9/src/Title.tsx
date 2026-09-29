import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

interface TitleProps {
  title: string;
  subtitle?: string;
  totalFrames: number;
}

export const Title: React.FC<TitleProps> = ({ title, subtitle, totalFrames }) => {
  const frame = useCurrentFrame();

  const line1Progress = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
  const line2Progress = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });
  const line3Progress = interpolate(frame, [22, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const float = interpolate(frame, [0, totalFrames], [0, -12], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const fadeOutStart = totalFrames * 0.8;
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const rotation = interpolate(frame, [0, totalFrames], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          border: "1px dashed rgba(167, 139, 250, 0.25)",
          borderRadius: "50%",
          transform: `rotate(${rotation}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          border: "1px solid rgba(236, 72, 153, 0.12)",
          borderRadius: "50%",
          transform: `rotate(${-rotation / 2}deg)`,
        }}
      />

      <div
        style={{
          fontSize: 34,
          color: "rgba(167, 139, 250, 0.9)",
          fontWeight: 500,
          letterSpacing: "0.3em",
          marginBottom: 36,
          textTransform: "uppercase",
          opacity: line1Progress,
          transform: `translateY(${interpolate(line1Progress, [0, 1], [20, 0])}px)`,
        }}
      >
        {subtitle ?? "REPRESENTATION"}
      </div>

      <div
        style={{
          fontSize: 144,
          color: "#ffffff",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          textAlign: "center",
          padding: "0 120px",
          opacity: line2Progress,
          transform: `translateY(${float + interpolate(line2Progress, [0, 1], [40, 0])}px) scale(${interpolate(line2Progress, [0, 1], [0.7, 1])})`,
          textShadow:
            "0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(167, 139, 250, 0.4)",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 64,
          display: "flex",
          justifyContent: "center",
          gap: 12,
          opacity: line3Progress,
          transform: `translateY(${interpolate(line3Progress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 80,
            height: 4,
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            borderRadius: 2,
            boxShadow: "0 0 16px rgba(167, 139, 250, 0.6)",
          }}
        />
        <div
          style={{
            width: 80,
            height: 4,
            background: "linear-gradient(90deg, #ec4899, #6366f1)",
            borderRadius: 2,
            boxShadow: "0 0 16px rgba(236, 72, 153, 0.6)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};