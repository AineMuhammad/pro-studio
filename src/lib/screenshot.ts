import { rendererRegistry } from "../store/rendererRegistry";
export function captureScreenshot(filename = "room-layout.png") {
  const renderer = rendererRegistry.renderer;
  if (!renderer) return;
  const dataUrl = renderer.domElement.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
