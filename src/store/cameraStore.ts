import { create } from "zustand";
import type { Vec3 } from "../types";
export type CameraMode = "orbit" | "topdown";
export interface FlightTarget {
  fromPosition: Vec3;
  fromTarget: Vec3;
  toPosition: Vec3;
  toTarget: Vec3;
  startTime: number;
}
export const DEFAULT_FOV = 50;
interface CameraStoreState {
  mode: CameraMode;
  roomCenter: Vec3;
  roomSize: Vec3;
  flight: FlightTarget | null;
  fov: number;
  setMode: (mode: CameraMode) => void;
  setRoomBounds: (center: Vec3, size: Vec3) => void;
  requestFlight: (
    fromPosition: Vec3,
    fromTarget: Vec3,
    toPosition: Vec3,
    toTarget: Vec3,
    now: number,
  ) => void;
  clearFlight: () => void;
  setFov: (fov: number) => void;
}
export const useCameraStore = create<CameraStoreState>((set) => ({
  mode: "orbit",
  roomCenter: [2.15, 1, -2.45],
  roomSize: [7, 2.7, 8],
  flight: null,
  fov: DEFAULT_FOV,
  setMode: (mode) => set({ mode }),
  setRoomBounds: (center, size) => set({ roomCenter: center, roomSize: size }),
  requestFlight: (fromPosition, fromTarget, toPosition, toTarget, now) =>
    set({ flight: { fromPosition, fromTarget, toPosition, toTarget, startTime: now } }),
  clearFlight: () => set({ flight: null }),
  setFov: (fov) => set({ fov }),
}));
export interface CameraPreset {
  id: string;
  label: string;
  position: Vec3;
  target: Vec3;
}
export const CAMERA_PRESETS: CameraPreset[] = [
  { id: "overview", label: "Overview", position: [3.6, 1.6, -1.0], target: [0.5, 1.0, -3.2] },
  { id: "kitchen", label: "View Kitchen", position: [1.3, 1.6, 0.4], target: [-0.6, 1.0, -1.6] },
  { id: "living", label: "View Living Room", position: [3.8, 1.6, -2.2], target: [1.8, 0.9, -4.4] },
  { id: "dining", label: "View Dining", position: [2.0, 1.6, -0.5], target: [4.3, 0.9, -0.9] },
];
