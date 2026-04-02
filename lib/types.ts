export type DistanceUnit = 'meters' | 'steps';

export interface Distances {
  cameraToAttacker: number;
  attackerToTarget: number;
  unit1: DistanceUnit;
  unit2: DistanceUnit;
  stepLength: number;
}

export interface AnalysisResult {
  startFrame: number;
  endFrame: number;
  fps: number;
  timeSeconds: number;
  speedMs: number;
  speedKmh: number;
}
