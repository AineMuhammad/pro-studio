import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import SceneRoot from "./SceneRoot";
import Lighting from "./Lighting";
import Gizmo from "./Gizmo";
import CameraRig from "./CameraRig";
import CameraBoundsClamp from "./CameraBoundsClamp";
import RoomControls from "./RoomControls";
import { useSceneStore } from "../store/sceneStore";
import { useCameraStore, CAMERA_PRESETS } from "../store/cameraStore";
import { rendererRegistry } from "../store/rendererRegistry";
import { controlsRegistry } from "../store/controlsRegistry";
const OVERVIEW = CAMERA_PRESETS[0];
const TOPDOWN_FOV = 20;
export default function SceneCanvas() {
  const select = useSceneStore((s) => s.select);
  const mode = useCameraStore((s) => s.mode);
  const roomCenter = useCameraStore((s) => s.roomCenter);
  const roomSize = useCameraStore((s) => s.roomSize);
  const fov = useCameraStore((s) => s.fov);
  const topdownHeight = roomCenter[1] * 2 + Math.max(roomSize[0], roomSize[2]) * 3.2 + 4;
  useEffect(() => {
    const controls = controlsRegistry.controls;
    if (!controls) return;
    if (useCameraStore.getState().flight) return;
    if (mode === "topdown") {
      controls.camera.position.set(roomCenter[0], topdownHeight, roomCenter[2]);
      controls.lookAt(new THREE.Vector3(roomCenter[0], 0, roomCenter[2]));
    } else {
      controls.camera.position.set(...OVERVIEW.position);
      controls.lookAt(new THREE.Vector3(...OVERVIEW.target));
    }
  }, [mode, roomCenter, topdownHeight]);
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl, scene }) => {
        rendererRegistry.set(gl);
        scene.background = new THREE.Color("#e9e6df");
      }}
      onPointerMissed={() => {
        if (useSceneStore.getState().snapPicking) {
          useSceneStore.getState().cancelSnapPicking();
        } else {
          select(null);
        }
      }}
    >
      <PerspectiveCamera
        makeDefault
        fov={mode === "topdown" ? TOPDOWN_FOV : fov}
        near={0.1}
        far={200}
      />
      <RoomControls
        ref={(node) => {
          controlsRegistry.set(node);
        }}
      />
      <Lighting />
      <Suspense fallback={null}>
        <SceneRoot />
      </Suspense>
      <Gizmo />
      <CameraRig />
      <CameraBoundsClamp />
    </Canvas>
  );
}
