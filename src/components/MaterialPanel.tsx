import { ChevronDown } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useSceneStore } from "../store/sceneStore";
import { templateRegistry } from "../store/templateRegistry";
import { materialFriendlyLabel } from "../lib/naming";
export default function MaterialPanel() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const obj = useSceneStore((s) => (s.selectedId ? s.objects[s.selectedId] : null));
  const liveUpdateMaterialOverride = useSceneStore((s) => s.liveUpdateMaterialOverride);
  const beginEdit = useSceneStore((s) => s.beginEdit);
  const commitEdit = useSceneStore((s) => s.commitEdit);
  if (!obj || !selectedId) return null;
  const template = templateRegistry.get(obj.sourceName);
  return (
    <div className="min-h-0 flex-1 space-y-2">
      <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {obj.isFixed ? "Surface Colors" : "Materials"}
      </Label>

      <div className="max-h-[52vh] overflow-y-auto">
        <div className="flex flex-col gap-2 py-1 pr-1 pl-1">
          {obj.materialNames.map((name) => {
            const defaults = template?.materialDefaults[name];
            const override = obj.materialOverrides[name];
            const color = override?.color ?? defaults?.color ?? "#cccccc";
            const roughness = override?.roughness ?? defaults?.roughness ?? 0.6;
            const metalness = override?.metalness ?? defaults?.metalness ?? 0;
            return (
              <Popover key={name}>
                <PopoverTrigger asChild>
                  <button className="hover:border-primary/40 hover:bg-muted flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors">
                    <span className="min-w-0 flex-1 truncate text-[15px]">
                      {materialFriendlyLabel(name)}
                    </span>
                    <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                    <span
                      className="size-7 shrink-0 rounded-lg border border-white/15 shadow-sm"
                      style={{ background: color }}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="left" align="start" className="w-64 space-y-4">
                  <HexColorPicker
                    color={color}
                    onPointerDown={() => beginEdit()}
                    onChange={(c) => liveUpdateMaterialOverride(selectedId, name, { color: c })}
                    onChangeEnd={() => commitEdit()}
                    style={{ width: "100%", height: 150 }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs">Roughness</Label>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {roughness.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[roughness]}
                      onPointerDown={() => beginEdit()}
                      onValueChange={([v]) =>
                        liveUpdateMaterialOverride(selectedId, name, { roughness: v })
                      }
                      onPointerUp={() => commitEdit()}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs">Metalness</Label>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {metalness.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[metalness]}
                      onPointerDown={() => beginEdit()}
                      onValueChange={([v]) =>
                        liveUpdateMaterialOverride(selectedId, name, { metalness: v })
                      }
                      onPointerUp={() => commitEdit()}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
}
