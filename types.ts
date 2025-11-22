export type AppState = 'intro' | 'shooting' | 'result';

export interface PhotoData {
  id: number;
  dataUrl: string;
}

export interface CameraConfig {
  countdownTime: number; // Seconds before each shot
  totalShots: number;
  delayBetweenShots: number; // Milliseconds
}