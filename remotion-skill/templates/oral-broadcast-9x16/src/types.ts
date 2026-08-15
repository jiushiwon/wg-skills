export interface Segment {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface Script {
  fps: number;
  durationInFrames: number;
  canvas: {
    width: number;
    height: number;
  };
  segments: Segment[];
}
