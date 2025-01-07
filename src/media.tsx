import { nanoid } from "nanoid";
import { toast } from "sonner";
import { saveImage } from "@/lib/wordpress";
import { Separator } from "@/components/ui/separator";
import { CreditMenu } from "@/components/credit-menu";
import { Generator } from "@/components/generator";
import { Provider } from "@/components/provider";
import type { OutputImage } from "@/types";

const { config, settings } = window.yodelImageAdmin;
const apiKey = settings.apiKey;

export default function Media() {
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="prose text-center">
          Please enter your valid API key on the{" "}
          <a href="/wp-admin/admin.php?page=yodel-image#/settings">
            settings page
          </a>
          <br />
          or{" "}
          <a
            href={`${config.apiUrl}/signup`}
            target="_blank"
            rel="noopener noreferrer"
          >
            create an account
          </a>{" "}
          to obtain one.
        </p>
      </div>
    );
  }

  return (
    <Provider>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="container p-0">
          <div className="container px-5 flex justify-between items-center gap-2 py-4">
            <h2 className="text-lg font-semibold whitespace-nowrap">
              Generate Image
            </h2>
            <div className="ml-auto flex space-x-2">
              <CreditMenu />
            </div>
          </div>
          <Separator />
        </div>
        <div className="container px-5 flex-1 py-6 overflow-auto">
          <Generator
            onSave={async (image: OutputImage) => {
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
                toast.error(
                  "Uh oh! Something went wrong while saving the image"
                );
              }
            }}
          />
        </div>
      </div>
    </Provider>
  );
}
