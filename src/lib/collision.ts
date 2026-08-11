import * as THREE from "three";
const EPS = 0.02;
export function boxesOverlap(a: THREE.Box3, b: THREE.Box3): boolean {
  return (
    a.max.x - EPS > b.min.x &&
    a.min.x + EPS < b.max.x &&
    a.max.y - EPS > b.min.y &&
    a.min.y + EPS < b.max.y &&
    a.max.z - EPS > b.min.z &&
    a.min.z + EPS < b.max.z
  );
}
export function worldBox(object: THREE.Object3D): THREE.Box3 {
  object.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(object);
}
export function floorYForObject(object: THREE.Object3D, floorY: number): number {
  const box = worldBox(object);
  const currentY = object.position.y;
  const bottomOffset = box.min.y - currentY;
  return floorY - bottomOffset;
}
