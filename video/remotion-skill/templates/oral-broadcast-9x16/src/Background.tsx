import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

// 固定粒子分布（保证 SSR 一致）
const PARTICLES = Array.from({ length: 32 }).map((_, i) => {
  const angle = (i / 32) * Math.PI * 2;
  const radius = 250 + (i % 5) * 80;
  return {
    cx: 540 + Math.cos(angle) * radius,
    cy: 960 + Math.sin(angle) * radius,
    size: 2 + (i % 4) * 1.5,
    phase: (i * 137) % 360,
    speed: 0.6 + (i % 3) * 0.3,
  };
});

const GRID_LINES = 8;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // 整体色相缓慢漂移
  const hueShift = interpolate(frame, [0, 1500], [210, 310], {
    extrapolateRight: "clamp",
  });
  const topColor = `hsl(${hueShift}, 55%, 10%)`;
  const midColor = `hsl(${hueShift + 20}, 50%, 16%)`;
  const bottomColor = `hsl(${hueShift - 30}, 65%, 6%)`;

  // 三色光晕：青、紫、粉
  const orb1X = interpolate(frame, [0, 1200], [180, 700], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orb1Y = interpolate(frame, [0, 1200], [300, 550], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const orb2X = interpolate(frame, [0, 1200], [900, 350], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orb2Y = interpolate(frame, [0, 1200], [1400, 1150], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const orb3X = interpolate(frame, [0, 1200], [500, 900], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const orb3Y = interpolate(frame, [0, 1200], [800, 1100], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // 旋转环
  const rotation1 = interpolate(frame, [0, 1500], [0, 360]);
  const rotation2 = interpolate(frame, [0, 1500], [360, 0]);

  // 网格扫描线
  const scanY = (frame * 4) % 2000;

  return (
    <AbsoluteFill>
      {/* 主渐变背景 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at top, ${midColor} 0%, ${topColor} 50%, ${bottomColor} 100%)`,
        }}
      />

      {/* 三色光晕 */}
      <div
        style={{
          position: "absolute",
          left: orb1X,
          top: orb1Y,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(99, 102, 241, 0) 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: orb2X,
          top: orb2Y,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(236, 72, 153, 0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: orb3X,
          top: orb3Y,
          width: 460,
          height: 460,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.30) 0%, rgba(34, 211, 238, 0) 70%)",
          filter: "blur(55px)",
        }}
      />

      {/* 旋转装饰环 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1200,
          height: 1200,
          marginLeft: -600,
          marginTop: -600,
          border: "1px dashed rgba(167, 139, 250, 0.18)",
          borderRadius: "50%",
          transform: `rotate(${rotation1}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1500,
          height: 1500,
          marginLeft: -750,
          marginTop: -750,
          border: "1px solid rgba(236, 72, 153, 0.10)",
          borderRadius: "50%",
          transform: `rotate(${rotation2}deg)`,
        }}
      />

      {/* 透视网格线（向远方汇聚） */}
      <svg
        width="1080"
        height="1920"
        style={{
          position: "absolute",
          opacity: 0.18,
        }}
      >
        {Array.from({ length: GRID_LINES }).map((_, i) => {
          const x = (i / (GRID_LINES - 1)) * 1080;
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={1920}
              x2={540}
              y2={1100}
              stroke="rgba(167, 139, 250, 0.5)"
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const y = 1100 + i * 90;
          return (
            <line
              key={`h${i}`}
              x1={0}
              y1={y}
              x2={1080}
              y2={y}
              stroke="rgba(167, 139, 250, 0.3)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* 扫描光带 */}
      <div
        style={{
          position: "absolute",
          top: scanY - 100,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(180deg, rgba(99, 102, 241, 0) 0%, rgba(167, 139, 250, 0.12) 50%, rgba(99, 102, 241, 0) 100%)",
          filter: "blur(20px)",
        }}
      />

      {/* 粒子星空 */}
      {PARTICLES.map((p, i) => {
        // 粒子沿极坐标漂浮
        const t = (frame + p.phase) * 0.01 * p.speed;
        const drift = 40;
        const x = p.cx + Math.cos(t) * drift;
        const y = p.cy + Math.sin(t * 0.7) * drift;
        const alpha = 0.4 + 0.4 * Math.sin((frame + p.phase) * 0.05);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 1)",
              boxShadow: `0 0 ${p.size * 3}px rgba(167, 139, 250, ${alpha})`,
              opacity: alpha,
            }}
          />
        );
      })}

      {/* 顶部装饰条 + 底部装饰条 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.7) 50%, rgba(236,72,153,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.5) 50%, rgba(236,72,153,0) 100%)",
        }}
      />

      {/* 角落科技装饰 */}
      <CornerDecor position="top-left" />
      <CornerDecor position="top-right" />
      <CornerDecor position="bottom-left" />
      <CornerDecor position="bottom-right" />
    </AbsoluteFill>
  );
};

const CornerDecor: React.FC<{ position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }> = ({ position }) => {
  const positions = {
    "top-left": { top: 80, left: 80, transform: "rotate(0deg)" },
    "top-right": { top: 80, right: 80, transform: "rotate(90deg)" },
    "bottom-left": { bottom: 80, left: 80, transform: "rotate(-90deg)" },
    "bottom-right": { bottom: 80, right: 80, transform: "rotate(180deg)" },
  } as const;
  const p = positions[position];

  return (
    <div
      style={{
        position: "absolute",
        ...p,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48">
        <path
          d="M 4 24 L 4 4 L 24 4"
          stroke="rgba(167, 139, 250, 0.5)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="4" cy="4" r="3" fill="rgba(99, 102, 241, 0.6)" />
      </svg>
    </div>
  );
};