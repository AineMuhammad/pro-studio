import type { LightingMode, SceneObjects } from "../types";
export interface ShareableState {
  objects: SceneObjects;
  lightingMode: LightingMode;
}
export function encodeShareState(state: ShareableState): string {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return encodeURIComponent(btoa(binary));
}
export function decodeShareState(encoded: string): ShareableState | null {
  try {
    const binary = atob(decodeURIComponent(encoded));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as ShareableState;
  } catch {
    return null;
  }
}
export function readShareStateFromLocation(): ShareableState | null {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return null;
  const params = new URLSearchParams(hash.slice(1));
  const s = params.get("s");
  return s ? decodeShareState(s) : null;
}
export function buildShareUrl(state: ShareableState): string {
  const encoded = encodeShareState(state);
  const url = `${window.location.origin}${window.location.pathname}#s=${encoded}`;
  window.history.replaceState(null, "", url);
  return url;
}
