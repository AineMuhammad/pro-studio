import { useEffect, useState } from "react";
import * as THREE from "three";
import { Camera, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { controlsRegistry } from "../store/controlsRegistry";
import { useCameraStore } from "../store/cameraStore";
const MIN_HEIGHT = 0.3;
const CEILING_INSET = 0.3;
const HEIGHT_STEP = 0.1;
const MIN_FOV = 20;
const MAX_FOV = 90;
const FOV_STEP = 5;
const MIN_ANGLE = 0;
const MAX_ANGLE = 180;
const ANGLE_STEP = 1;
function focalLengthMm(fovDeg: number): number {
  return 12 / Math.tan((fovDeg / 2) * (Math.PI / 180));
}
export default function CameraSettingsPopover() {
  const mode = useCameraStore((s) => s.mode);
  const roomSize = useCameraStore((s) => s.roomSize);
  const fov = useCameraStore((s) => s.fov);
  const setFov = useCameraStore((s) => s.setFov);
  const maxHeight = Math.max(MIN_HEIGHT + 0.1, roomSize[1] - CEILING_INSET);
  const [height, setHeight] = useState(1.6);
  const [angle, setAngle] = useState(90);
  useEffect(() => {
    const id = window.setInterval(() => {
      const controls = controlsRegistry.controls;
      if (!controls) return;
      const y = controls.camera.position.y;
      setHeight((prev) => (Math.abs(prev - y) > 0.005 ? y : prev));
      const deg = 90 + THREE.MathUtils.radToDeg(controls.pitch);
      setAngle((prev) => (Math.abs(prev - deg) > 0.5 ? deg : prev));
    }, 100);
    return () => window.clearInterval(id);
  }, []);
  const clampedHeight = Math.min(Math.max(height, MIN_HEIGHT), maxHeight);
  const disabled = mode === "topdown";
  const setClampedHeight = (y: number) => {
    const controls = controlsRegistry.controls;
    if (!controls) return;
    const clamped = Math.min(Math.max(y, MIN_HEIGHT), maxHeight);
    controls.camera.position.y = clamped;
    setHeight(clamped);
  };
  const setClampedAngle = (deg: number) => {
    const controls = controlsRegistry.controls;
    if (!controls) return;
    const clamped = Math.min(Math.max(deg, MIN_ANGLE), MAX_ANGLE);
    controls.setPitch(THREE.MathUtils.degToRad(clamped - 90));
    setAngle(clamped);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="lg" disabled={disabled}>
          <Camera />
          Camera
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="camera-height">Height</Label>
            <span className="text-muted-foreground text-sm tabular-nums">
              {clampedHeight.toFixed(1)}m
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Slider
              id="camera-height"
              min={MIN_HEIGHT}
              max={maxHeight}
              step={0.05}
              value={[clampedHeight]}
              onValueChange={([y]) => setClampedHeight(y)}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setClampedHeight(clampedHeight - HEIGHT_STEP)}
            >
              <Minus />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setClampedHeight(clampedHeight + HEIGHT_STEP)}
            >
              <Plus />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="camera-angle">Angle</Label>
            <span className="text-muted-foreground text-sm tabular-nums">{Math.round(angle)}°</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Slider
              id="camera-angle"
              min={MIN_ANGLE}
              max={MAX_ANGLE}
              step={ANGLE_STEP}
              value={[angle]}
              disabled={disabled}
              onValueChange={([v]) => setClampedAngle(v)}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="icon"
              disabled={disabled}
              onClick={() => setClampedAngle(angle - ANGLE_STEP)}
            >
              <Minus />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              disabled={disabled}
              onClick={() => setClampedAngle(angle + ANGLE_STEP)}
            >
              <Plus />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="camera-fov">Field of view</Label>
            <span className="text-muted-foreground text-sm tabular-nums">
              {Math.round(focalLengthMm(fov))}mm
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Slider
              id="camera-fov"
              min={MIN_FOV}
              max={MAX_FOV}
              step={1}
              value={[fov]}
              onValueChange={([v]) => setFov(v)}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setFov(Math.max(MIN_FOV, fov - FOV_STEP))}
            >
              <Minus />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setFov(Math.min(MAX_FOV, fov + FOV_STEP))}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
