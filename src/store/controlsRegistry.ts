import type { FirstPersonControls } from "../lib/FirstPersonControls";
class ControlsRegistry {
  controls: FirstPersonControls | null = null;
  set(c: FirstPersonControls | null) {
    this.controls = c;
  }
}
export const controlsRegistry = new ControlsRegistry();
