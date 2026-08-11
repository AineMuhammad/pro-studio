export type Vec3 = [number, number, number];
export interface MaterialOverride {
  color?: string;
  roughness?: number;
  metalness?: number;
}
export interface ObjectState {
  id: string;
  sourceName: string;
  productKey: string;
  displayName: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  isFixed: boolean;
  materialNames: string[];
  materialOverrides: Record<string, MaterialOverride>;
}
export type SceneObjects = Record<string, ObjectState>;
export type LightingMode = "day" | "night";
export interface CatalogEntry {
  productKey: string;
  label: string;
  templateSourceName: string;
}
