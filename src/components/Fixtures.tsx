import { useSceneStore } from "../store/sceneStore";
export default function Fixtures() {
  const pendant = useSceneStore((s) => s.objects["PendantLight"]);
  const fixturesOn = useSceneStore((s) => s.fixturesOn);
  const lightingMode = useSceneStore((s) => s.lightingMode);
  const isNight = lightingMode === "night";
  if (!pendant || !fixturesOn) return null;
  return (
    <pointLight
      position={pendant.position}
      intensity={isNight ? 14 : 4}
      distance={9}
      decay={1.8}
      color={isNight ? "#ffd9a0" : "#fff4e0"}
      castShadow
    />
  );
}
