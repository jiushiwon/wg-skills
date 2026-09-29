import { Composition, AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Subtitle } from "./Subtitle";
import { Title } from "./Title";
import { EndCard } from "./EndCard";
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
    <AbsoluteFill>
      <Background />
      {script.title ? (
        <Title
          title={script.title.text}
          subtitle={script.title.subtitle}
          totalFrames={script.title.durationFrames}
        />
      ) : null}
      <Subtitle segments={script.segments} />
      {script.endCard ? (
        <EndCard
          startFrame={script.endCard.startFrame}
          durationFrames={script.endCard.durationFrames}
          message={script.endCard.message}
          hint={script.endCard.hint}
        />
      ) : null}
    </AbsoluteFill>
  );
};