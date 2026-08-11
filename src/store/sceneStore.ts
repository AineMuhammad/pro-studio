import { create } from "zustand";
import type { LightingMode, MaterialOverride, ObjectState, SceneObjects, Vec3 } from "../types";
import { templateRegistry } from "./templateRegistry";
const HISTORY_LIMIT = 100;
function cloneObjects(objects: SceneObjects): SceneObjects {
  const out: SceneObjects = {};
  for (const [id, obj] of Object.entries(objects)) {
    out[id] = {
      ...obj,
      position: [...obj.position] as Vec3,
      rotation: [...obj.rotation] as Vec3,
      scale: [...obj.scale] as Vec3,
      materialNames: [...obj.materialNames],
      materialOverrides: Object.fromEntries(
        Object.entries(obj.materialOverrides).map(([k, v]) => [k, { ...v }]),
      ),
    };
  }
  return out;
}
interface SceneStoreState {
  objects: SceneObjects;
  selectedId: string | null;
  lightingMode: LightingMode;
  fixturesOn: boolean;
  past: SceneObjects[];
  future: SceneObjects[];
  editBaseline: SceneObjects | null;
  collidingIds: Set<string>;
  setCollidingIds: (ids: Set<string>) => void;
  gizmoMode: "translate" | "rotate";
  setGizmoMode: (mode: "translate" | "rotate") => void;
  snapPicking: boolean;
  startSnapPicking: () => void;
  cancelSnapPicking: () => void;
  loadInitialObjects: (objects: ObjectState[]) => void;
  select: (id: string | null) => void;
  beginEdit: () => void;
  liveUpdateTransform: (
    id: string,
    partial: Partial<Pick<ObjectState, "position" | "rotation" | "scale">>,
  ) => void;
  commitEdit: () => void;
  cancelEdit: () => void;
  setTransform: (
    id: string,
    partial: Partial<Pick<ObjectState, "position" | "rotation" | "scale">>,
  ) => void;
  snapOnto: (id: string, position: Vec3) => void;
  liveUpdateMaterialOverride: (
    id: string,
    materialName: string,
    override: MaterialOverride,
  ) => void;
  duplicateObject: (id: string) => string | null;
  deleteObject: (id: string) => void;
  addFromCatalog: (productKey: string) => string | null;
  undo: () => void;
  redo: () => void;
  setLightingMode: (mode: LightingMode) => void;
  toggleFixtures: () => void;
  replaceScene: (objects: SceneObjects) => void;
}
function pushHistory(state: Pick<SceneStoreState, "past" | "future">, snapshot: SceneObjects) {
  const past = [...state.past, snapshot];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { past, future: [] as SceneObjects[] };
}
let spawnCounter = 0;
export const useSceneStore = create<SceneStoreState>((set, get) => ({
  objects: {},
  selectedId: null,
  lightingMode: "night",
  fixturesOn: true,
  past: [],
  future: [],
  editBaseline: null,
  collidingIds: new Set(),
  setCollidingIds: (ids) => set({ collidingIds: ids }),
  gizmoMode: "translate",
  setGizmoMode: (mode) => set({ gizmoMode: mode }),
  snapPicking: false,
  startSnapPicking: () =>
    set((s) => (s.selectedId && !s.objects[s.selectedId]?.isFixed ? { snapPicking: true } : s)),
  cancelSnapPicking: () => set({ snapPicking: false }),
  loadInitialObjects: (objects) => {
    const map: SceneObjects = {};
    for (const o of objects) map[o.id] = o;
    set({
      objects: map,
      past: [],
      future: [],
      selectedId: null,
      editBaseline: null,
      snapPicking: false,
    });
  },
  select: (id) => set({ selectedId: id, snapPicking: false }),
  beginEdit: () => set((s) => ({ editBaseline: cloneObjects(s.objects) })),
  liveUpdateTransform: (id, partial) =>
    set((s) => {
      const existing = s.objects[id];
      if (!existing) return s;
      return { objects: { ...s.objects, [id]: { ...existing, ...partial } } };
    }),
  commitEdit: () =>
    set((s) => {
      if (!s.editBaseline) return s;
      const baselineObj = JSON.stringify(s.editBaseline);
      const currentObj = JSON.stringify(s.objects);
      if (baselineObj === currentObj) return { editBaseline: null };
      const { past, future } = pushHistory(s, s.editBaseline);
      return { past, future, editBaseline: null };
    }),
  cancelEdit: () =>
    set((s) => {
      if (!s.editBaseline) return s;
      return { objects: s.editBaseline, editBaseline: null };
    }),
  setTransform: (id, partial) =>
    set((s) => {
      const existing = s.objects[id];
      if (!existing) return s;
      const { past, future } = pushHistory(s, cloneObjects(s.objects));
      return {
        past,
        future,
        objects: { ...s.objects, [id]: { ...existing, ...partial } },
      };
    }),
  snapOnto: (id, position) =>
    set((s) => {
      const existing = s.objects[id];
      if (!existing || existing.isFixed) return { snapPicking: false };
      const { past, future } = pushHistory(s, cloneObjects(s.objects));
      return {
        past,
        future,
        snapPicking: false,
        objects: { ...s.objects, [id]: { ...existing, position } },
      };
    }),
  liveUpdateMaterialOverride: (id, materialName, override) =>
    set((s) => {
      const existing = s.objects[id];
      if (!existing) return s;
      return {
        objects: {
          ...s.objects,
          [id]: {
            ...existing,
            materialOverrides: {
              ...existing.materialOverrides,
              [materialName]: { ...existing.materialOverrides[materialName], ...override },
            },
          },
        },
      };
    }),
  duplicateObject: (id) => {
    const s = get();
    const src = s.objects[id];
    if (!src || src.isFixed) return null;
    const newId = `${src.sourceName}__dup${spawnCounter++}_${Date.now().toString(36)}`;
    const clone: ObjectState = {
      ...src,
      id: newId,
      position: [src.position[0] + 0.35, src.position[1], src.position[2] + 0.35],
      rotation: [...src.rotation],
      scale: [...src.scale],
      materialNames: [...src.materialNames],
      materialOverrides: Object.fromEntries(
        Object.entries(src.materialOverrides).map(([k, v]) => [k, { ...v }]),
      ),
    };
    const { past, future } = pushHistory(s, cloneObjects(s.objects));
    set({
      past,
      future,
      objects: { ...s.objects, [newId]: clone },
      selectedId: newId,
      snapPicking: false,
    });
    return newId;
  },
  deleteObject: (id) => {
    const s = get();
    const target = s.objects[id];
    if (!target || target.isFixed) return;
    const { past, future } = pushHistory(s, cloneObjects(s.objects));
    const objects = { ...s.objects };
    delete objects[id];
    set({
      past,
      future,
      objects,
      selectedId: s.selectedId === id ? null : s.selectedId,
      snapPicking: false,
    });
  },
  addFromCatalog: (productKey) => {
    const entry = templateRegistry.catalog.find((c) => c.productKey === productKey);
    if (!entry) return null;
    const template = templateRegistry.get(entry.templateSourceName);
    if (!template) return null;
    const s = get();
    const newId = `${entry.productKey}__spawn${spawnCounter++}_${Date.now().toString(36)}`;
    const angle = (spawnCounter * 47) % 360;
    const radius = 1.2 + (spawnCounter % 4) * 0.4;
    const spawnPos: Vec3 = [
      2.15 + radius * Math.cos((angle * Math.PI) / 180),
      0,
      -2.45 + radius * Math.sin((angle * Math.PI) / 180),
    ];
    const obj: ObjectState = {
      id: newId,
      sourceName: entry.templateSourceName,
      productKey: entry.productKey,
      displayName: entry.label,
      position: spawnPos,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isFixed: false,
      materialNames: template.materialNames,
      materialOverrides: {},
    };
    const { past, future } = pushHistory(s, cloneObjects(s.objects));
    set({
      past,
      future,
      objects: { ...s.objects, [newId]: obj },
      selectedId: newId,
      snapPicking: false,
    });
    return newId;
  },
  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s;
      const past = [...s.past];
      const prev = past.pop()!;
      const future = [cloneObjects(s.objects), ...s.future];
      const selectedId = s.selectedId && prev[s.selectedId] ? s.selectedId : null;
      return { past, future, objects: prev, selectedId };
    }),
  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s;
      const future = [...s.future];
      const next = future.shift()!;
      const past = [...s.past, cloneObjects(s.objects)];
      const selectedId = s.selectedId && next[s.selectedId] ? s.selectedId : null;
      return { past, future, objects: next, selectedId };
    }),
  setLightingMode: (mode) => set({ lightingMode: mode }),
  toggleFixtures: () => set((s) => ({ fixturesOn: !s.fixturesOn })),
  replaceScene: (objects) =>
    set({
      objects,
      past: [],
      future: [],
      selectedId: null,
      editBaseline: null,
      snapPicking: false,
    }),
}));
