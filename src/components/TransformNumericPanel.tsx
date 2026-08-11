import { useEffect, useState } from "react";
import * as THREE from "three";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSceneStore } from "../store/sceneStore";
import type { Vec3 } from "../types";
interface NumberFieldProps {
  label: string;
  value: number;
  step?: number;
  onCommit: (value: number) => void;
}
function NumberField({ label, value, step = 0.01, onCommit }: NumberFieldProps) {
  const [text, setText] = useState(value.toFixed(2));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value.toFixed(2));
  }, [value, focused]);
  return (
    <label className="focus-within:border-ring/60 flex min-w-0 flex-1 items-center gap-1 rounded-lg border pl-2.5 transition-colors">
      <span className="text-muted-foreground shrink-0 text-xs font-medium">{label}</span>
      <Input
        type="number"
        step={step}
        value={text}
        onFocus={() => setFocused(true)}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          setFocused(false);
          const n = parseFloat(text);
          if (!Number.isNaN(n)) onCommit(n);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="h-10 min-w-0 border-0 px-1 text-[15px] shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
    </label>
  );
}
export default function TransformNumericPanel() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const obj = useSceneStore((s) => (s.selectedId ? s.objects[s.selectedId] : null));
  const setTransform = useSceneStore((s) => s.setTransform);
  if (!obj || !selectedId || obj.isFixed) return null;
  const setPositionAxis = (axis: 0 | 1 | 2, val: number) => {
    const next: Vec3 = [...obj.position];
    next[axis] = val;
    setTransform(selectedId, { position: next });
  };
  const setRotationAxisDeg = (axis: 0 | 1 | 2, deg: number) => {
    const next: Vec3 = [...obj.rotation];
    next[axis] = THREE.MathUtils.degToRad(deg);
    setTransform(selectedId, { rotation: next });
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Position (m)
        </Label>
        <div className="flex gap-2">
          <NumberField label="X" value={obj.position[0]} onCommit={(v) => setPositionAxis(0, v)} />
          <NumberField label="Y" value={obj.position[1]} onCommit={(v) => setPositionAxis(1, v)} />
          <NumberField label="Z" value={obj.position[2]} onCommit={(v) => setPositionAxis(2, v)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Rotation (deg)
        </Label>
        <div className="flex gap-2">
          <NumberField
            label="X"
            step={1}
            value={THREE.MathUtils.radToDeg(obj.rotation[0])}
            onCommit={(v) => setRotationAxisDeg(0, v)}
          />
          <NumberField
            label="Y"
            step={1}
            value={THREE.MathUtils.radToDeg(obj.rotation[1])}
            onCommit={(v) => setRotationAxisDeg(1, v)}
          />
          <NumberField
            label="Z"
            step={1}
            value={THREE.MathUtils.radToDeg(obj.rotation[2])}
            onCommit={(v) => setRotationAxisDeg(2, v)}
          />
        </div>
      </div>
    </div>
  );
}
