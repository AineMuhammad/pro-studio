import { create } from "zustand";
import { useSceneStore } from "./sceneStore";
export type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "scene-viewer:theme";
function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function applyTheme(pref: ThemePreference) {
  const isDark = pref === "dark" || (pref === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
  useSceneStore.getState().setLightingMode(isDark ? "night" : "day");
}
function readInitial(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "dark";
}
interface ThemeState {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}
const initial = readInitial();
applyTheme(initial);
export const useThemeStore = create<ThemeState>((set) => ({
  preference: initial,
  setPreference: (pref) => {
    localStorage.setItem(STORAGE_KEY, pref);
    applyTheme(pref);
    set({ preference: pref });
  },
}));
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (useThemeStore.getState().preference === "system") applyTheme("system");
});
