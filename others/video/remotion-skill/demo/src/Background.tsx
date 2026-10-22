import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // 背景主色相循环（青蓝 → 紫 → 深红橙），形成缓慢的氛围变化
  const hueShift = interpolate(frame, [0, 900], [210, 280], {
    extrapolateRight: "clamp",
  });
  const topColor = `hsl(${hueShift}, 55%, 12%)`;
  const midColor = `hsl(${hueShift + 15}, 50%, 18%)`;
  const bottomColor = `hsl(${hueShift - 20}, 60%, 8%)`;

  // 浮动光晕1（左上角）
  const orb1X = interpolate(frame, [0, 900], [200, 600], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orb1Y = interpolate(frame, [0, 900], [300, 500], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  // 浮动光晕2（右下角）
  const orb2X = interpolate(frame, [0, 900], [800, 400], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orb2Y = interpolate(frame, [0, 900], [1500, 1300], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill>
      {/* 主体渐变背景 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at top, ${midColor} 0%, ${topColor} 50%, ${bottomColor} 100%)`,
        }}
      />

      {/* 装饰光晕1 */}
      <div
        style={{
          position: "absolute",
          left: orb1X,
          top: orb1Y,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0) 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* 装饰光晕2 */}
      <div
        style={{
          position: "absolute",
          left: orb2X,
          top: orb2Y,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0) 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* 顶部装饰条 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.6) 50%, rgba(236,72,153,0) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};