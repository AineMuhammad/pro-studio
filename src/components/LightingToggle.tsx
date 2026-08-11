import { Lightbulb, MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSceneStore } from "../store/sceneStore";
export default function LightingToggle() {
  const lightingMode = useSceneStore((s) => s.lightingMode);
  const setLightingMode = useSceneStore((s) => s.setLightingMode);
  const fixturesOn = useSceneStore((s) => s.fixturesOn);
  const toggleFixtures = useSceneStore((s) => s.toggleFixtures);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="lg">
          {lightingMode === "night" ? <MoonStar /> : <SunMedium />}
          Lighting
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup
          value={lightingMode}
          onValueChange={(v) => setLightingMode(v as "day" | "night")}
        >
          <DropdownMenuRadioItem value="day">
            <SunMedium /> Day
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="night">
            <MoonStar /> Night
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={fixturesOn} onCheckedChange={() => toggleFixtures()}>
          <Lightbulb /> Light fixtures
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
