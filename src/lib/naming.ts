export function humanize(name: string): string {
  return name
    .replace(/\.\d+$/, "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}
export function productKeyFromNodeName(name: string): string {
  return name.replace(/\.\d+$/, "").replace(/_\d+$/, "");
}
export function materialFriendlyLabel(materialName: string): string {
  const parts = materialName.split("__");
  const label = parts.length > 1 ? parts[1] : materialName;
  return label
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/(\d+)/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
}
export function isFixedArchitecture(nodeName: string): boolean {
  return /^Room_/.test(nodeName) || /^Wall_/.test(nodeName);
}
