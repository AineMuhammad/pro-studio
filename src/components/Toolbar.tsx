import { useEffect } from "react";
import { Copy, Move, RotateCw, Trash2, ArrowDownToLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSceneStore } from "../store/sceneStore";
interface Props {
  className?: string;
}
export default function Toolbar({ className }: Props) {
  const selectedId = useSceneStore((s) => s.selectedId);
  const obj = useSceneStore((s) => (s.selectedId ? s.objects[s.selectedId] : null));
  const gizmoMode = useSceneStore((s) => s.gizmoMode);
  const setGizmoMode = useSceneStore((s) => s.setGizmoMode);
  const duplicateObject = useSceneStore((s) => s.duplicateObject);
  const deleteObject = useSceneStore((s) => s.deleteObject);
  const snapPicking = useSceneStore((s) => s.snapPicking);
  const startSnapPicking = useSceneStore((s) => s.startSnapPicking);
  const cancelSnapPicking = useSceneStore((s) => s.cancelSnapPicking);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "Escape" && snapPicking) {
        e.preventDefault();
        cancelSnapPicking();
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteObject(selectedId);
      } else if (e.key.toLowerCase() === "g") {
        setGizmoMode("translate");
      } else if (e.key.toLowerCase() === "r") {
        setGizmoMode("rotate");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateObject(selectedId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, deleteObject, setGizmoMode, duplicateObject, snapPicking, cancelSnapPicking]);
  if (!obj || !selectedId || obj.isFixed) return null;
  if (snapPicking) {
    return (
      <div
        className={cn(
          "border-primary/50 bg-popover/90 absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-xl border px-5 py-2.5 shadow-lg backdrop-blur-xl",
          className,
        )}
      >
        <span className="text-[15px] font-medium">
          Click another object or the floor to snap {obj.displayName} onto it
        </span>
        <Button variant="secondary" size="default" onClick={() => cancelSnapPicking()}>
          <X /> Cancel
        </Button>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "bg-popover/90 absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-2.5 shadow-lg backdrop-blur-xl",
        className,
      )}
    >
      <span className="text-muted-foreground max-w-40 truncate pl-1 text-[15px] font-medium">
        {obj.displayName}
      </span>
      <Separator orientation="vertical" className="h-6!" />
      <ToggleGroup
        type="single"
        variant="outline"
        size="lg"
        value={gizmoMode}
        onValueChange={(v) => v && setGizmoMode(v as "translate" | "rotate")}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="translate" aria-label="Move">
              <Move />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Move (G)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="rotate" aria-label="Rotate">
              <RotateCw />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Rotate (R)</TooltipContent>
        </Tooltip>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6!" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={() => startSnapPicking()}>
            <ArrowDownToLine />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Snap onto another object or the floor</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={() => duplicateObject(selectedId)}>
            <Copy />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            className="text-destructive hover:bg-destructive/15 hover:text-destructive"
            onClick={() => deleteObject(selectedId)}
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete (Del)</TooltipContent>
      </Tooltip>
    </div>
  );
}
