import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FirstPersonControls } from "../lib/FirstPersonControls";
import { useCameraStore } from "../store/cameraStore";
interface Props {
  onChange?: () => void;
}
const RoomControls = forwardRef<FirstPersonControls, Props>(function RoomControls(
  { onChange },
  ref,
) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const set = useThree((s) => s.set);
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  const clockRef = useRef({ last: performance.now() / 1000 });
  const controls = useMemo(
    () => new FirstPersonControls(camera, gl.domElement),
    [camera, gl.domElement],
  );
  useImperativeHandle(ref, () => controls, [controls]);
  useEffect(() => {
    controls.connect();
    return () => controls.dispose();
  }, [controls]);
  useEffect(() => {
    const callback = () => {
      invalidate();
      onChange?.();
    };
    controls.addEventListener("change", callback);
    return () => controls.removeEventListener("change", callback);
  }, [controls, invalidate, onChange]);
  useEffect(() => {
    const cancelFlight = () => {
      if (useCameraStore.getState().flight) useCameraStore.getState().clearFlight();
    };
    controls.addEventListener("start", cancelFlight);
    controls.addEventListener("change", cancelFlight);
    return () => {
      controls.removeEventListener("start", cancelFlight);
      controls.removeEventListener("change", cancelFlight);
    };
  }, [controls]);
  useEffect(() => {
    const old = get().controls;
    set({ controls: controls as never });
    return () => set({ controls: old });
  }, [controls, get, set]);
  useFrame(() => {
    const now = performance.now() / 1000;
    const delta = Math.min(now - clockRef.current.last, 0.1);
    clockRef.current.last = now;
    controls.update(delta);
  });
  return null;
});
export default RoomControls;
