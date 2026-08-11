import * as THREE from "three";
import { ChefHat, ChevronDown, Eye, House, Sofa, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CAMERA_PRESETS, useCameraStore } from "../store/cameraStore";
import { controlsRegistry } from "../store/controlsRegistry";
import type { Vec3 } from "../types";
const LOOK_AHEAD = 3;
const PRESET_ICONS: Record<string, typeof House> = {
  overview: House,
  kitchen: ChefHat,
  living: Sofa,
  dining: UtensilsCrossed,
};
export default function CameraPresets() {
  const mode = useCameraStore((s) => s.mode);
  const setMode = useCameraStore((s) => s.setMode);
  const requestFlight = useCameraStore((s) => s.requestFlight);
  const flyTo = (position: Vec3, target: Vec3) => {
    const controls = controlsRegistry.controls;
    if (!controls) return;
    const cam = controls.camera;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    const currentLookPoint = cam.position.clone().addScaledVector(forward, LOOK_AHEAD);
    setMode("orbit");
    requestFlight(
      [cam.position.x, cam.position.y, cam.position.z],
      [currentLookPoint.x, currentLookPoint.y, currentLookPoint.z],
      position,
      target,
      performance.now() / 1000,
    );
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="lg">
          <Eye />
          View
          <ChevronDown className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {CAMERA_PRESETS.map((p) => {
          const Icon = PRESET_ICONS[p.id] ?? House;
          return (
            <DropdownMenuItem key={p.id} onSelect={() => flyTo(p.position, p.target)}>
              <Icon />
              {p.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={mode === "topdown"}
          onCheckedChange={(checked) => setMode(checked ? "topdown" : "orbit")}
        >
          Floor Plan (top-down)
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
