import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

const PARTICLES = Array.from({ length: 40 }).map((_, i) => {
  const angle = (i / 40) * Math.PI * 2;
  const radius = 350 + (i % 5) * 100;
  return {
    cx: 960 + Math.cos(angle) * radius,
    cy: 540 + Math.sin(angle) * radius,
    size: 2 + (i % 4) * 1.5,
    phase: (i * 137) % 360,
    speed: 0.6 + (i % 3) * 0.3,
  };
});

const GRID_LINES = 12;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const hueShift = interpolate(frame, [0, 1500], [210, 310], {
    extrapolateRight: "clamp",
  });
  const topColor = `hsl(${hueShift}, 55%, 10%)`;
  const midColor = `hsl(${hueShift + 20}, 50%, 16%)`;
  const bottomColor = `hsl(${hueShift - 30}, 65%, 6%)`;

  const orb1X = interpolate(frame, [0, 1200], [350, 1200], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orb1Y = interpolate(frame, [0, 1200], [200, 450], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const orb2X = interpolate(frame, [0, 1200], [1500, 700], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orb2Y = interpolate(frame, [0, 1200], [800, 600], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const orb3X = interpolate(frame, [0, 1200], [900, 1500], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const orb3Y = interpolate(frame, [0, 1200], [300, 700], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const rotation1 = interpolate(frame, [0, 1500], [0, 360]);
  const rotation2 = interpolate(frame, [0, 1500], [360, 0]);

  const scanY = (frame * 4) % 1200;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at top, ${midColor} 0%, ${topColor} 50%, ${bottomColor} 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: orb1X,
          top: orb1Y,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(99, 102, 241, 0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: orb2X,
          top: orb2Y,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(236, 72, 153, 0) 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: orb3X,
          top: orb3Y,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.30) 0%, rgba(34, 211, 238, 0) 70%)",
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1400,
          height: 1400,
          marginLeft: -700,
          marginTop: -700,
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
          width: 1800,
          height: 1800,
          marginLeft: -900,
          marginTop: -900,
          border: "1px solid rgba(236, 72, 153, 0.10)",
          borderRadius: "50%",
          transform: `rotate(${rotation2}deg)`,
        }}
      />

      <svg
        width="1920"
        height="1080"
        style={{
          position: "absolute",
          opacity: 0.18,
        }}
      >
        {Array.from({ length: GRID_LINES }).map((_, i) => {
          const x = (i / (GRID_LINES - 1)) * 1920;
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={1080}
              x2={960}
              y2={600}
              stroke="rgba(167, 139, 250, 0.5)"
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const y = 600 + i * 70;
          return (
            <line
              key={`h${i}`}
              x1={0}
              y1={y}
              x2={1920}
              y2={y}
              stroke="rgba(167, 139, 250, 0.3)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

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

      {PARTICLES.map((p, i) => {
        const t = (frame + p.phase) * 0.01 * p.speed;
        const drift = 50;
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