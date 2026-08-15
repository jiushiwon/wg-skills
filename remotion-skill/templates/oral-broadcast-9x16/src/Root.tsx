import { Composition } from "remotion";
import { Background } from "./Background";
import { Subtitle } from "./Subtitle";
import type { Script } from "./types";
import script from "./script.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={script.durationInFrames}
      fps={script.fps}
      width={script.canvas.width}
      height={script.canvas.height}
      defaultProps={{ script }}
    />
  );
};

const Main: React.FC<{ script: Script }> = ({ script }) => {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Background />
      <Subtitle segments={script.segments} />
    </div>
  );
};
