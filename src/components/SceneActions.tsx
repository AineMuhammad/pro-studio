import { useState } from "react";
import { Check, FolderOpen, ImageDown, Link2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSceneStore } from "../store/sceneStore";
import { captureScreenshot } from "../lib/screenshot";
import { buildShareUrl } from "../lib/shareLink";
import { loadLayoutFromLocalStorage, saveLayoutToLocalStorage } from "../lib/persistence";
export default function SceneActions() {
  const objects = useSceneStore((s) => s.objects);
  const lightingMode = useSceneStore((s) => s.lightingMode);
  const replaceScene = useSceneStore((s) => s.replaceScene);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const handleShare = async () => {
    const url = buildShareUrl({ objects, lightingMode });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };
  const handleSave = () => {
    saveLayoutToLocalStorage(objects);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={() => captureScreenshot()}>
            <ImageDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download screenshot</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={handleShare}>
            {copied ? <Check /> : <Link2 />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy shareable link"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={handleSave}>
            {saved ? <Check /> : <Save />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{saved ? "Saved!" : "Save layout"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => {
              const layout = loadLayoutFromLocalStorage();
              if (layout && Object.keys(layout).length > 0) replaceScene(layout);
            }}
          >
            <FolderOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Load saved layout</TooltipContent>
      </Tooltip>
    </div>
  );
}
