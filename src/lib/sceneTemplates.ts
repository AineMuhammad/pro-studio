import * as THREE from "three";
import type { CatalogEntry, ObjectState, Vec3 } from "../types";
import { humanize, isFixedArchitecture, productKeyFromNodeName } from "./naming";
export interface MaterialDefaults {
  color: string;
  roughness: number;
  metalness: number;
}
export interface ProductTemplate {
  sourceName: string;
  object3D: THREE.Object3D;
  materialNames: string[];
  materialDefaults: Record<string, MaterialDefaults>;
  isFixed: boolean;
}
export interface ParsedScene {
  templates: Map<string, ProductTemplate>;
  initialObjects: ObjectState[];
  catalog: CatalogEntry[];
}
let anonMaterialCounter = 0;
function ensureNamedMaterial(mesh: THREE.Mesh, nodeName: string): string {
  const mat = mesh.material as THREE.Material | THREE.Material[];
  const assignOne = (m: THREE.Material | null): THREE.Material => {
    if (m && m.name) return m;
    const fresh = new THREE.MeshStandardMaterial({
      color: 0xd8d5cf,
      roughness: 0.85,
      metalness: 0,
      side: THREE.DoubleSide,
      name: `${nodeName}__Surface`,
    });
    return fresh;
  };
  if (Array.isArray(mat)) {
    mesh.material = mat.map((m) => assignOne(m));
    return (mesh.material[0] as THREE.Material).name;
  }
  if (!mat || !mat.name) {
    mesh.material = assignOne(mat ?? null);
    return mesh.material.name;
  }
  return mat.name;
}
function collectMaterialNames(root: THREE.Object3D, nodeName: string): string[] {
  const names = new Set<string>();
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (!mesh.material) {
        const fresh = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          name: `${nodeName}__Material${anonMaterialCounter++}`,
        });
        mesh.material = fresh;
        names.add(fresh.name);
        return;
      }
      const name = ensureNamedMaterial(mesh, nodeName);
      names.add(name);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => names.add(m.name));
    }
  });
  return Array.from(names);
}
function collectMaterialDefaults(root: THREE.Object3D): Record<string, MaterialDefaults> {
  const defaults: Record<string, MaterialDefaults> = {};
  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mats = (child as THREE.Mesh).material;
    const list = Array.isArray(mats) ? mats : [mats];
    for (const m of list) {
      if (!m || defaults[m.name]) continue;
      const std = m as THREE.MeshStandardMaterial;
      defaults[m.name] = {
        color: std.color ? `#${std.color.getHexString()}` : "#cccccc",
        roughness: "roughness" in std ? std.roughness : 0.6,
        metalness: "metalness" in std ? std.metalness : 0,
      };
    }
  });
  return defaults;
}
function vec3From(v: THREE.Vector3): Vec3 {
  return [v.x, v.y, v.z];
}
function eulerFrom(e: THREE.Euler): Vec3 {
  return [e.x, e.y, e.z];
}
export function parseGLTFScene(scene: THREE.Group): ParsedScene {
  const templates = new Map<string, ProductTemplate>();
  const initialObjects: ObjectState[] = [];
  const catalogByKey = new Map<string, CatalogEntry>();
  const topLevel = [...scene.children];
  for (const node of topLevel) {
    const sourceName = node.name;
    if (!sourceName) continue;
    const fixed = isFixedArchitecture(sourceName);
    const template = node.clone(true);
    template.position.set(0, 0, 0);
    template.rotation.set(0, 0, 0);
    template.scale.set(1, 1, 1);
    const materialNames = collectMaterialNames(template, sourceName);
    const materialDefaults = collectMaterialDefaults(template);
    templates.set(sourceName, {
      sourceName,
      object3D: template,
      materialNames,
      materialDefaults,
      isFixed: fixed,
    });
    initialObjects.push({
      id: sourceName,
      sourceName,
      productKey: productKeyFromNodeName(sourceName),
      displayName: humanize(sourceName),
      position: vec3From(node.position),
      rotation: eulerFrom(node.rotation),
      scale: vec3From(node.scale),
      isFixed: fixed,
      materialNames,
      materialOverrides: {},
    });
    if (!fixed) {
      const productKey = productKeyFromNodeName(sourceName);
      if (!catalogByKey.has(productKey)) {
        catalogByKey.set(productKey, {
          productKey,
          label: humanize(productKey),
          templateSourceName: sourceName,
        });
      }
    }
  }
  return { templates, initialObjects, catalog: Array.from(catalogByKey.values()) };
}
