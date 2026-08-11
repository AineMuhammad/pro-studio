import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../store/cameraStore";
import { controlsRegistry } from "../store/controlsRegistry";
const MARGIN = 0.4;
const MIN_Y = 0.15;
const MAX_Y_INSET = 0.3;
export default function CameraBoundsClamp() {
  useFrame(() => {
    const { mode, roomCenter, roomSize } = useCameraStore.getState();
    if (mode !== "orbit") return;
    const controls = controlsRegistry.controls;
    if (!controls) return;
    const minX = roomCenter[0] - roomSize[0] / 2 + MARGIN;
    const maxX = roomCenter[0] + roomSize[0] / 2 - MARGIN;
    const minZ = roomCenter[2] - roomSize[2] / 2 + MARGIN;
    const maxZ = roomCenter[2] + roomSize[2] / 2 - MARGIN;
    const maxY = Math.max(MIN_Y + 0.1, roomSize[1] - MAX_Y_INSET);
    const pos = controls.camera.position;
    pos.x = Math.min(Math.max(pos.x, minX), maxX);
    pos.y = Math.min(Math.max(pos.y, MIN_Y), maxY);
    pos.z = Math.min(Math.max(pos.z, minZ), maxZ);
  });
  return null;
}
