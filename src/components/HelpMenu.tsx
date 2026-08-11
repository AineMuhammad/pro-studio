import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const SHORTCUTS: {
  keys: string;
  action: string;
}[] = [
  { keys: "Click", action: "Select an object" },
  { keys: "Left drag", action: "Look around" },
  { keys: "Right drag", action: "Pan the camera" },
  { keys: "Scroll", action: "Move forward / back" },
  { keys: "W A S D", action: "Walk" },
  { keys: "G", action: "Move tool" },
  { keys: "R", action: "Rotate tool" },
  { keys: "Ctrl/⌘ D", action: "Duplicate selection" },
  { keys: "Delete", action: "Delete selection" },
  { keys: "Ctrl/⌘ Z", action: "Undo" },
  { keys: "Ctrl/⌘ ⇧ Z", action: "Redo" },
  { keys: "Esc", action: "Cancel snap-to picking" },
];
export default function HelpMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-lg">
          <HelpCircle />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="mb-1 px-1 text-sm font-semibold">Shortcuts</div>
        <div className="flex flex-col">
          {SHORTCUTS.map(({ keys, action }) => (
            <div key={keys} className="flex items-center justify-between px-1 py-1.5 text-sm">
              <span className="text-muted-foreground">{action}</span>
              <kbd className="bg-muted rounded-md px-2 py-0.5 font-mono text-xs">{keys}</kbd>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
