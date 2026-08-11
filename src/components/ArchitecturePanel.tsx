import { BrickWall } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSceneStore } from "../store/sceneStore";
export default function ArchitecturePanel() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const select = useSceneStore((s) => s.select);
  const architecture = Object.values(objects)
    .filter((o) => o.isFixed)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  if (architecture.length === 0) {
    return <p className="text-muted-foreground px-1 text-sm">Loading scene…</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      {architecture.map((o) => {
        const active = selectedId === o.id;
        return (
          <button
            key={o.id}
            onClick={() => select(o.id)}
            title={`Select ${o.displayName}`}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <BrickWall
              className={cn(
                "size-4.5 shrink-0",
                active ? "text-primary-foreground" : "text-muted-foreground",
              )}
            />
            <span className="flex-1 truncate text-[15px]">{o.displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
