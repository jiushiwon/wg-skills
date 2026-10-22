export interface Segment {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface TitleConfig {
  text: string;
  subtitle?: string;
  durationFrames: number;
}

export interface EndCardConfig {
  message: string;
  hint?: string;
  startFrame: number;
  durationFrames: number;
}

export interface Script {
  fps: number;
  durationInFrames: number;
  canvas: {
    width: number;
    height: number;
  };
  title?: TitleConfig;
  segments: Segment[];
  endCard?: EndCardConfig;
}