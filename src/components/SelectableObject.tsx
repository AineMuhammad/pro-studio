import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "../store/sceneStore";
import { templateRegistry } from "../store/templateRegistry";
import { objectRegistry } from "../store/objectRegistry";
import { floorYForObject } from "../lib/collision";
interface Props {
  id: string;
}
const SELECTION_COLOR = "#ffb648";
const COLLISION_COLOR = "#ff4d4f";
export default function SelectableObject({ id }: Props) {
  const obj = useSceneStore((s) => s.objects[id]);
  const selectedId = useSceneStore((s) => s.selectedId);
  const select = useSceneStore((s) => s.select);
  const snapOnto = useSceneStore((s) => s.snapOnto);
  const cancelSnapPicking = useSceneStore((s) => s.cancelSnapPicking);
  const collidingIds = useSceneStore((s) => s.collidingIds);
  const fixturesOn = useSceneStore((s) => s.fixturesOn);
  const lightingMode = useSceneStore((s) => s.lightingMode);
  const groupRef = useRef<THREE.Group>(null);
  const instance = useMemo(() => {
    const template = templateRegistry.get(obj.sourceName);
    if (!template) return null;
    const clone = template.object3D.clone(true);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
      }
    });
    return clone;
  }, [obj.sourceName, id]);
  const highlightGeometry = useMemo(() => {
    if (!instance) return null;
    instance.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(instance);
    if (box.isEmpty()) return null;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const geom = new THREE.BoxGeometry(size.x + 0.02, size.y + 0.02, size.z + 0.02);
    geom.translate(center.x, center.y, center.z);
    return new THREE.EdgesGeometry(geom);
  }, [instance]);
  useEffect(() => {
    if (groupRef.current) objectRegistry.set(id, groupRef.current);
    return () => objectRegistry.delete(id);
  }, [id]);
  useEffect(() => {
    if (!instance) return;
    instance.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials as THREE.Material[]) {
        const std = mat as THREE.MeshStandardMaterial;
        if (mat.name.includes("__LED") || mat.name.includes("__Light")) {
          std.emissiveIntensity = fixturesOn ? (lightingMode === "night" ? 22 : 15) : 0;
          mat.needsUpdate = true;
        }
        const override = obj.materialOverrides[mat.name];
        if (!override) continue;
        if (override.color && std.color) std.color.set(override.color);
        if (override.roughness !== undefined && "roughness" in std)
          std.roughness = override.roughness;
        if (override.metalness !== undefined && "metalness" in std)
          std.metalness = override.metalness;
        mat.needsUpdate = true;
      }
    });
  }, [instance, obj.materialOverrides, fixturesOn, lightingMode]);
  if (!instance) return null;
  const isSelected = selectedId === id;
  const isColliding = collidingIds.has(id);
  return (
    <group
      ref={groupRef}
      name={id}
      userData={{ objectId: id, isFixed: obj.isFixed }}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={(e) => {
        e.stopPropagation();
        const picking = useSceneStore.getState();
        if (picking.snapPicking && picking.selectedId && picking.selectedId !== id) {
          const sourceId = picking.selectedId;
          const sourceObj3D = objectRegistry.get(sourceId);
          if (sourceObj3D) {
            const newY = floorYForObject(sourceObj3D, e.point.y);
            snapOnto(sourceId, [e.point.x, newY, e.point.z]);
          } else {
            cancelSnapPicking();
          }
          return;
        }
        if (picking.snapPicking) {
          cancelSnapPicking();
          return;
        }
        select(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
      }}
    >
      <primitive object={instance} />
      {isSelected && highlightGeometry && (
        <lineSegments geometry={highlightGeometry} renderOrder={999}>
          <lineBasicMaterial
            color={isColliding ? COLLISION_COLOR : SELECTION_COLOR}
            depthTest={false}
            transparent
            opacity={0.95}
          />
        </lineSegments>
      )}
    </group>
  );
}
