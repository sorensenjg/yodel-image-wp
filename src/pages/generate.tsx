import { Separator } from "@/components/ui/separator";
import { GenerateImage } from "@/components/generate-image";

export function GeneratePage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="container p-0">
          <div className="container px-5 flex justify-between items-center gap-2 py-4">
            <h2 className="text-lg font-semibold whitespace-nowrap">
              Generate
            </h2>
            <div className="ml-auto flex space-x-2"></div>
          </div>
        </div>
        <Separator />
        <div className="container flex-1 px-5 py-6 overflow-auto">
          <GenerateImage />
        </div>
      </div>
    </div>
  );
}
