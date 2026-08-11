import * as THREE from "three";
class ObjectRegistry {
  private map = new Map<string, THREE.Object3D>();
  private listeners = new Set<() => void>();
  set(id: string, object: THREE.Object3D) {
    this.map.set(id, object);
    this.emit();
  }
  delete(id: string) {
    this.map.delete(id);
    this.emit();
  }
  get(id: string): THREE.Object3D | undefined {
    return this.map.get(id);
  }
  getAll(): THREE.Object3D[] {
    return Array.from(this.map.values());
  }
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() {
    this.listeners.forEach((fn) => fn());
  }
}
export const objectRegistry = new ObjectRegistry();
