import { Package2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSceneStore } from "../store/sceneStore";
import { templateRegistry } from "../store/templateRegistry";
export default function Catalog() {
  const objects = useSceneStore((s) => s.objects);
  const selectedProductKey = useSceneStore((s) =>
    s.selectedId ? s.objects[s.selectedId]?.productKey : null,
  );
  const addFromCatalog = useSceneStore((s) => s.addFromCatalog);
  const select = useSceneStore((s) => s.select);
  const ready = Object.keys(objects).length > 0;
  const catalog = ready ? templateRegistry.catalog : [];
  if (!ready) {
    return <p className="text-muted-foreground px-1 text-sm">Loading scene…</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      {catalog.map((entry) => {
        const active = entry.productKey === selectedProductKey;
        return (
          <button
            key={entry.productKey}
            onClick={() => {
              const id = addFromCatalog(entry.productKey);
              if (id) select(id);
            }}
            title={`Add ${entry.label}`}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <Package2
              className={cn(
                "size-4.5 shrink-0",
                active ? "text-primary-foreground" : "text-muted-foreground",
              )}
            />
            <span className="flex-1 truncate text-[15px]">{entry.label}</span>
            <Plus
              className={cn(
                "size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
                active ? "text-primary-foreground" : "text-muted-foreground",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
