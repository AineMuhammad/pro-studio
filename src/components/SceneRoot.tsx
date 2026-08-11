import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { parseGLTFScene } from "../lib/sceneTemplates";
import { templateRegistry } from "../store/templateRegistry";
import { useSceneStore } from "../store/sceneStore";
import { useCameraStore } from "../store/cameraStore";
import { readShareStateFromLocation } from "../lib/shareLink";
import SelectableObject from "./SelectableObject";
import Fixtures from "./Fixtures";
const MODEL_URL = `${import.meta.env.BASE_URL}models/scene.glb`;
export default function SceneRoot() {
  const gltf = useGLTF(MODEL_URL);
  const objects = useSceneStore((s) => s.objects);
  const loadInitialObjects = useSceneStore((s) => s.loadInitialObjects);
  const replaceScene = useSceneStore((s) => s.replaceScene);
  const setLightingMode = useSceneStore((s) => s.setLightingMode);
  const setRoomBounds = useCameraStore((s) => s.setRoomBounds);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !gltf?.scene) return;
    initialized.current = true;
    const { templates, initialObjects, catalog } = parseGLTFScene(gltf.scene);
    templateRegistry.set(templates, catalog);
    const floor = gltf.scene.children.find((c) => c.name === "Room_Floor");
    if (floor) {
      const box = new THREE.Box3().setFromObject(floor);
      const center = box.getCenter(new THREE.Vector3());
      const ceiling = gltf.scene.children.find((c) => c.name === "Room_Ceiling");
      const height = ceiling ? new THREE.Box3().setFromObject(ceiling).max.y : 2.7;
      setRoomBounds(
        [center.x, height / 2, center.z],
        [box.max.x - box.min.x, height, box.max.z - box.min.z],
      );
    }
    const shared = readShareStateFromLocation();
    const sharedObjectList = shared ? Object.values(shared.objects) : [];
    const validShared =
      shared &&
      sharedObjectList.length > 0 &&
      sharedObjectList.every((o) => templates.has(o.sourceName))
        ? shared
        : null;
    if (validShared) {
      replaceScene(validShared.objects);
      setLightingMode(validShared.lightingMode);
    } else {
      loadInitialObjects(initialObjects);
    }
  }, [gltf, loadInitialObjects, replaceScene, setLightingMode, setRoomBounds]);
  const ids = Object.keys(objects);
  if (ids.length === 0) return null;
  return (
    <>
      {ids.map((id) => (
        <SelectableObject key={id} id={id} />
      ))}
      <Fixtures />
    </>
  );
}
useGLTF.preload(MODEL_URL);
