import type { ProductTemplate } from "../lib/sceneTemplates";
import type { CatalogEntry } from "../types";
class TemplateRegistry {
  templates = new Map<string, ProductTemplate>();
  catalog: CatalogEntry[] = [];
  set(templates: Map<string, ProductTemplate>, catalog: CatalogEntry[]) {
    this.templates = templates;
    this.catalog = catalog;
  }
  get(sourceName: string): ProductTemplate | undefined {
    return this.templates.get(sourceName);
  }
}
export const templateRegistry = new TemplateRegistry();
