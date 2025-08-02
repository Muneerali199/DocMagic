export interface CursorPosition {
  x: number;
  y: number;
}

export interface CursorConfig {
  dotColor: string;
  trailColor: string;
  dotSize: number;
  trailSize: number;
  trailSpeed: number;
  hoverScale: number;
  disabled: boolean;
}

export interface CursorHookOptions {
  trailSpeed?: number;
  disabled?: boolean;
  hoverScale?: number;
}

export interface CursorContextType {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  dotColor: string;
  setDotColor: (color: string) => void;
  trailColor: string;
  setTrailColor: (color: string) => void;
}

export interface ColorPreset {
  name: string;
  dot: string;
  trail: string;
  gradient?: string;
}

export type CursorColorVariant = "blue" | "amber" | "emerald" | "purple" | "rose" | "cyan";

export interface InteractiveElementProps {
  cursorScale?: number;
  cursorColor?: CursorColorVariant;
}