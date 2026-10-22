import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

interface TitleProps {
  title: string;
  subtitle?: string;
  totalFrames: number;
}

export const Title: React.FC<TitleProps> = ({ title, subtitle, totalFrames }) => {
  const frame = useCurrentFrame();

  // 入场动画（3 阶段，更戏剧化）
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

  // 持续期间漂浮效果
  const float = interpolate(frame, [0, totalFrames], [0, -12], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  // 离场淡出（最后 20%）
  const fadeOutStart = totalFrames * 0.8;
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 旋转外环
  const rotation = interpolate(frame, [0, totalFrames], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* 旋转装饰环 */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          border: "1px dashed rgba(167, 139, 250, 0.25)",
          borderRadius: "50%",
          transform: `rotate(${rotation}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          border: "1px solid rgba(236, 72, 153, 0.12)",
          borderRadius: "50%",
          transform: `rotate(${-rotation / 2}deg)`,
        }}
      />

      {/* 副标题 */}
      <div
        style={{
          fontSize: 30,
          color: "rgba(167, 139, 250, 0.9)",
          fontWeight: 500,
          letterSpacing: "0.3em",
          marginBottom: 32,
          textTransform: "uppercase",
          opacity: line1Progress,
          transform: `translateY(${interpolate(line1Progress, [0, 1], [20, 0])}px)`,
        }}
      >
        {subtitle ?? "REPRESENTATION"}
      </div>

      {/* 主标题 */}
      <div
        style={{
          fontSize: 108,
          color: "#ffffff",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          textAlign: "center",
          padding: "0 60px",
          opacity: line2Progress,
          transform: `translateY(${float + interpolate(line2Progress, [0, 1], [40, 0])}px) scale(${interpolate(line2Progress, [0, 1], [0.7, 1])})`,
          textShadow:
            "0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(167, 139, 250, 0.4)",
        }}
      >
        {title}
      </div>

      {/* 装饰条 */}
      <div
        style={{
          marginTop: 56,
          display: "flex",
          justifyContent: "center",
          gap: 12,
          opacity: line3Progress,
          transform: `translateY(${interpolate(line3Progress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 60,
            height: 4,
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            borderRadius: 2,
            boxShadow: "0 0 16px rgba(167, 139, 250, 0.6)",
          }}
        />
        <div
          style={{
            width: 60,
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