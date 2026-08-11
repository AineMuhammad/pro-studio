import { TransformControls } from "@react-three/drei";
import { useSceneStore } from "../store/sceneStore";
import { objectRegistry } from "../store/objectRegistry";
import { boxesOverlap, floorYForObject, worldBox } from "../lib/collision";
const COLLISION_EXCLUDED = new Set(["Room_Floor", "Room_Ceiling"]);
export default function Gizmo() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const obj = useSceneStore((s) => (s.selectedId ? s.objects[s.selectedId] : null));
  const gizmoMode = useSceneStore((s) => s.gizmoMode);
  const beginEdit = useSceneStore((s) => s.beginEdit);
  const commitEdit = useSceneStore((s) => s.commitEdit);
  const liveUpdateTransform = useSceneStore((s) => s.liveUpdateTransform);
  const setCollidingIds = useSceneStore((s) => s.setCollidingIds);
  const target = selectedId ? objectRegistry.get(selectedId) : undefined;
  if (!obj || obj.isFixed || !target) return null;
  const checkCollisions = () => {
    if (!selectedId) return;
    const selfBox = worldBox(target);
    const collidingWith = new Set<string>();
    for (const other of objectRegistry.getAll()) {
      const otherId = other.userData?.objectId as string | undefined;
      if (!otherId || otherId === selectedId) continue;
      if (COLLISION_EXCLUDED.has(otherId)) continue;
      if (boxesOverlap(selfBox, worldBox(other))) collidingWith.add(otherId);
    }
    setCollidingIds(collidingWith.size > 0 ? new Set([selectedId, ...collidingWith]) : new Set());
  };
  return (
    <TransformControls
      object={target}
      mode={gizmoMode}
      space="world"
      showX={gizmoMode === "translate"}
      showY={gizmoMode === "rotate"}
      showZ={gizmoMode === "translate"}
      onMouseDown={() => beginEdit()}
      onObjectChange={() => {
        if (!selectedId) return;
        if (gizmoMode === "translate") {
          target.position.y = floorYForObject(target, 0);
        }
        checkCollisions();
        liveUpdateTransform(selectedId, {
          position: [target.position.x, target.position.y, target.position.z],
          rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
          scale: [target.scale.x, target.scale.y, target.scale.z],
        });
      }}
      onMouseUp={() => {
        if (!selectedId) return;
        commitEdit();
        setCollidingIds(new Set());
      }}
    />
  );
}
