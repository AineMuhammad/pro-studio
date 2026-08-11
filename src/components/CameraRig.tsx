import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCameraStore } from "../store/cameraStore";
import { controlsRegistry } from "../store/controlsRegistry";
const DURATION = 1.1;
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
export default function CameraRig() {
  const { camera } = useThree();
  const flight = useCameraStore((s) => s.flight);
  const clearFlight = useCameraStore((s) => s.clearFlight);
  useFrame(() => {
    if (!flight) return;
    const controls = controlsRegistry.controls;
    const elapsed = performance.now() / 1000 - flight.startTime;
    const t = Math.min(elapsed / DURATION, 1);
    const e = easeInOutCubic(t);
    camera.position.set(
      THREE.MathUtils.lerp(flight.fromPosition[0], flight.toPosition[0], e),
      THREE.MathUtils.lerp(flight.fromPosition[1], flight.toPosition[1], e),
      THREE.MathUtils.lerp(flight.fromPosition[2], flight.toPosition[2], e),
    );
    const lookPoint = new THREE.Vector3(
      THREE.MathUtils.lerp(flight.fromTarget[0], flight.toTarget[0], e),
      THREE.MathUtils.lerp(flight.fromTarget[1], flight.toTarget[1], e),
      THREE.MathUtils.lerp(flight.fromTarget[2], flight.toTarget[2], e),
    );
    if (controls) controls.lookAt(lookPoint);
    else camera.lookAt(lookPoint);
    if (t >= 1) clearFlight();
  });
  return null;
}
