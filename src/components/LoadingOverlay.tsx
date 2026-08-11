import { useProgress } from "@react-three/drei";
import { cn } from "@/lib/utils";
import { useSceneStore } from "../store/sceneStore";
interface Props {
  className?: string;
}
export default function LoadingOverlay({ className }: Props) {
  const { progress } = useProgress();
  const ready = useSceneStore((s) => Object.keys(s.objects).length > 0);
  if (ready) return null;
  const pct = Math.min(100, Math.round(progress));
  return (
    <div
      className={cn(
        "bg-background absolute inset-0 z-20 flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <div className="border-border border-t-primary size-10 animate-spin rounded-full border-[3px]" />
      <div className="text-muted-foreground text-sm">Loading room…</div>
      <div className="bg-muted h-1 w-56 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-muted-foreground text-xs tabular-nums">{pct}%</div>
    </div>
  );
}
