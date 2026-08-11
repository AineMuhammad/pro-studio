import { useState } from "react";
import { Box, Check, Save } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import SceneCanvas from "./components/SceneCanvas";
import LeftSidebar from "./components/LeftSidebar";
import Toolbar from "./components/Toolbar";
import LoadingOverlay from "./components/LoadingOverlay";
import TransformNumericPanel from "./components/TransformNumericPanel";
import MaterialPanel from "./components/MaterialPanel";
import CameraPresets from "./components/CameraPresets";
import CameraSettingsPopover from "./components/CameraSettingsPopover";
import LightingToggle from "./components/LightingToggle";
import HistoryControls from "./components/HistoryControls";
import SceneActions from "./components/SceneActions";
import ThemeToggle from "./components/ThemeToggle";
import HelpMenu from "./components/HelpMenu";
import { useSceneStore } from "./store/sceneStore";
import { saveLayoutToLocalStorage } from "./lib/persistence";
import { cn } from "@/lib/utils";
function App() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const snapPicking = useSceneStore((s) => s.snapPicking);
  const selectedObj = useSceneStore((s) => (s.selectedId ? s.objects[s.selectedId] : null));
  const objects = useSceneStore((s) => s.objects);
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    saveLayoutToLocalStorage(objects);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  return (
    <TooltipProvider>
      <div className="text-foreground relative h-screen w-screen overflow-hidden text-base">
        <div
          className={cn(
            "absolute inset-0",
            snapPicking && "cursor-crosshair [&_canvas]:cursor-crosshair",
          )}
        >
          <SceneCanvas />
        </div>

        <div className="pointer-events-none relative flex h-full flex-col">
          <header className="bg-background/90 pointer-events-auto flex h-20 shrink-0 items-center gap-3 border-b px-5 backdrop-blur-md">
            <div className="mr-2 flex shrink-0 items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl">
                <Box className="size-5" strokeWidth={2.25} />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">Pro Studio</h1>
            </div>
            <Separator orientation="vertical" className="h-7!" />
            <div className="flex items-center gap-2">
              <LightingToggle />
              <CameraPresets />
              <CameraSettingsPopover />
            </div>
            <Separator orientation="vertical" className="h-7!" />
            <HistoryControls />
            <div className="flex-1" />
            <SceneActions />
            <Separator orientation="vertical" className="h-7!" />
            <ThemeToggle />
            <HelpMenu />
          </header>

          <div className="flex min-h-0 flex-1">
            <aside className="bg-sidebar/60 pointer-events-auto w-80 shrink-0 border-r backdrop-blur-sm">
              <LeftSidebar />
            </aside>

            <main className="relative min-w-0 flex-1">
              <Toolbar className="pointer-events-auto" />
              <LoadingOverlay className="pointer-events-auto" />
            </main>

            <aside className="bg-sidebar/60 pointer-events-auto flex w-84 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4 backdrop-blur-sm">
              {selectedId && selectedObj ? (
                <>
                  <h2 className="px-1 text-base font-semibold">
                    {selectedObj.displayName} Properties
                  </h2>
                  <TransformNumericPanel />
                  <MaterialPanel />
                  <div className="flex-1" />
                  <Button size="lg" className="w-full" onClick={handleSave}>
                    {saved ? <Check /> : <Save />}
                    {saved ? "Saved!" : "Save"}
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground px-1 text-sm">
                  Click any piece of furniture, wall, or the floor to select and edit it.
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
export default App;
