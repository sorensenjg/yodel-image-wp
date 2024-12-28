import { nanoid } from "nanoid";
import { toast } from "sonner";
import { saveImage } from "@/lib/wordpress";
import { Separator } from "@/components/ui/separator";
import { Generator } from "@/components/generator";
import type { OutputImage } from "@/types";

export function GeneratePage() {
  const handleSave = async (image: OutputImage) => {
    if (!image) {
      toast.error("No image available to save");
      return;
    }

    try {
      const blob = image.output;
      const filename = `${nanoid()}.${image.input.outputFormat}`;
      const file = new File([blob], filename, { type: blob.type });

      const response = await saveImage(file, {
        yodel_image_input: JSON.stringify(image.input),
        yodel_image_seed: image.seed,
      });

      if (!response.id) {
        throw new Error("Invalid response saving image");
      }

      toast.success(`Image saved successfully`);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Uh oh! Something went wrong while saving the image");
    }
  };

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
          <Generator onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
