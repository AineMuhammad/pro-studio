import * as THREE from "three";
const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, -1);
const RIGHT = new THREE.Vector3(1, 0, 0);
interface FirstPersonControlsEvents {
  change: object;
  start: object;
  end: object;
}
export class FirstPersonControls extends THREE.EventDispatcher<FirstPersonControlsEvents> {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  enabled = true;
  yaw = 0;
  pitch = 0;
  lookSpeed = 0.0014;
  panSpeed = 0.002;
  moveSpeed = 1.4;
  dollySpeed = 0.001;
  minPitch = -Math.PI / 2 + 0.001;
  maxPitch = Math.PI / 2 - 0.001;
  private dragButton: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private static readonly DRAG_THRESHOLD = 3;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragEngaged = false;
  private keys = new Set<string>();
  private disposed = false;
  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    super();
    this.camera = camera;
    this.domElement = domElement;
  }
  connect() {
    this.disposed = false;
    const el = this.domElement;
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointercancel", this.onPointerUp);
    el.addEventListener("wheel", this.onWheel, { passive: false });
    el.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
  }
  dispose() {
    this.disposed = true;
    const el = this.domElement;
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerup", this.onPointerUp);
    el.removeEventListener("pointercancel", this.onPointerUp);
    el.removeEventListener("wheel", this.onWheel);
    el.removeEventListener("contextmenu", this.onContextMenu);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
  }
  lookAt(point: THREE.Vector3) {
    const dir = point.clone().sub(this.camera.position).normalize();
    this.yaw = Math.atan2(-dir.x, -dir.z);
    this.pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
    this.applyOrientation();
  }
  applyOrientation() {
    this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
  }
  setPitch(pitch: number) {
    this.pitch = THREE.MathUtils.clamp(pitch, this.minPitch, this.maxPitch);
    this.applyOrientation();
    this.dispatchEvent({ type: "change" });
  }
  private onPointerDown = (e: PointerEvent) => {
    if (!this.enabled || this.disposed) return;
    if (e.button !== 0 && e.button !== 2) return;
    this.dragButton = e.button;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragEngaged = false;
    this.domElement.setPointerCapture(e.pointerId);
    this.dispatchEvent({ type: "start" });
  };
  private onPointerMove = (e: PointerEvent) => {
    if (!this.enabled || this.dragButton === null) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    if (!this.dragEngaged) {
      const totalX = e.clientX - this.dragStartX;
      const totalY = e.clientY - this.dragStartY;
      if (Math.hypot(totalX, totalY) < FirstPersonControls.DRAG_THRESHOLD) return;
      this.dragEngaged = true;
    }
    if (this.dragButton === 0) {
      this.yaw -= dx * this.lookSpeed;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch - dy * this.lookSpeed,
        this.minPitch,
        this.maxPitch,
      );
      this.applyOrientation();
    } else {
      const right = RIGHT.clone().applyQuaternion(this.camera.quaternion);
      this.camera.position.addScaledVector(right, -dx * this.panSpeed);
      this.camera.position.addScaledVector(UP, dy * this.panSpeed);
    }
    this.dispatchEvent({ type: "change" });
  };
  private onPointerUp = (e: PointerEvent) => {
    if (this.dragButton === null) return;
    this.dragButton = null;
    if (this.domElement.hasPointerCapture(e.pointerId)) {
      this.domElement.releasePointerCapture(e.pointerId);
    }
    this.dispatchEvent({ type: "end" });
  };
  private onWheel = (e: WheelEvent) => {
    if (!this.enabled) return;
    e.preventDefault();
    const forward = FORWARD.clone().applyQuaternion(this.camera.quaternion);
    this.camera.position.addScaledVector(forward, -e.deltaY * this.dollySpeed);
    this.dispatchEvent({ type: "change" });
  };
  private onContextMenu = (e: MouseEvent) => e.preventDefault();
  private onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
    this.keys.add(e.code);
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private onBlur = () => {
    this.keys.clear();
    this.dragButton = null;
  };
  update(delta: number) {
    if (!this.enabled || this.keys.size === 0) return;
    let moveX = 0;
    let moveZ = 0;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) moveZ -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) moveZ += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) moveX -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) moveX += 1;
    if (!moveX && !moveZ) return;
    const forward = FORWARD.clone().applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    if (forward.lengthSq() > 0) forward.normalize();
    const right = RIGHT.clone().applyQuaternion(this.camera.quaternion);
    right.y = 0;
    if (right.lengthSq() > 0) right.normalize();
    const move = new THREE.Vector3();
    move.addScaledVector(forward, -moveZ);
    move.addScaledVector(right, moveX);
    if (move.lengthSq() === 0) return;
    move.normalize().multiplyScalar(this.moveSpeed * delta);
    this.camera.position.add(move);
    this.dispatchEvent({ type: "change" });
  }
}
