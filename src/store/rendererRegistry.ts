import type * as THREE from "three";
class RendererRegistry {
  renderer: THREE.WebGLRenderer | null = null;
  set(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
  }
}
export const rendererRegistry = new RendererRegistry();
