import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Catalog from "./Catalog";
import ArchitecturePanel from "./ArchitecturePanel";
export default function LeftSidebar() {
  return (
    <Tabs defaultValue="catalog" className="flex h-full min-h-0 flex-col gap-0">
      <div className="border-b px-3 pt-3 pb-2">
        <TabsList className="h-11 w-full p-1">
          <TabsTrigger value="catalog" className="text-sm">
            Catalog
          </TabsTrigger>
          <TabsTrigger value="architecture" className="text-sm">
            Architecture
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="catalog" className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <Catalog />
      </TabsContent>
      <TabsContent value="architecture" className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <ArchitecturePanel />
      </TabsContent>
    </Tabs>
  );
}
