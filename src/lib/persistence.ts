import type { SceneObjects } from "../types";
const KEY = "scene-viewer:layout:v1";
export function saveLayoutToLocalStorage(objects: SceneObjects) {
  localStorage.setItem(KEY, JSON.stringify(objects));
}
export function loadLayoutFromLocalStorage(): SceneObjects | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SceneObjects;
  } catch {
    return null;
  }
}
export function hasSavedLayout(): boolean {
  return localStorage.getItem(KEY) !== null;
}
