import { Environment } from "@react-three/drei";
import { useSceneStore } from "../store/sceneStore";
const SUN_POSITION: [number, number, number] = [-40, 45, -50];
export default function Lighting() {
  const lightingMode = useSceneStore((s) => s.lightingMode);
  const isNight = lightingMode === "night";
  return (
    <>
      <ambientLight intensity={isNight ? 0.22 : 0.1} color={isNight ? "#5c4a36" : "#dce6f5"} />
      <directionalLight
        position={[-4, 4.5, -5]}
        intensity={isNight ? 1.6 : 5.2}
        color={isNight ? "#ffb066" : "#fff4e2"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-radius={isNight ? 7 : 1.5}
        shadow-bias={-0.0004}
      />
      <directionalLight
        position={[5, 3, 4]}
        intensity={isNight ? 0.12 : 0.18}
        color={isNight ? "#4d6fb0" : "#cfe0ff"}
      />
      {!isNight && (
        <mesh position={SUN_POSITION}>
          <sphereGeometry args={[3, 16, 16]} />
          <meshBasicMaterial color="#fff6e0" toneMapped={false} />
        </mesh>
      )}
      <Environment
        preset={isNight ? "night" : "park"}
        background
        backgroundBlurriness={0.55}
        environmentIntensity={isNight ? 0.35 : 0.3}
      />
    </>
  );
}
