import React from "react";
import { createRoot, Root } from "react-dom/client";
import { nanoid } from "nanoid";
import { saveImage } from "@/lib/wordpress";
import { Generator } from "@/components/generator";
import { Provider } from "@/components/provider";
import { toast } from "sonner";
import type { Config, Settings, OutputImage } from "@/types";

declare const wp: any;

export class GeneratorHandler {
  private root: Root | null = null;
  private media: any;
  private imageEdit: any;
  private config: Config;
  private settings: Settings;

  constructor() {
    this.media = wp.media;
    this.imageEdit = window.imageEdit;
    this.config = window.yodelImageAdmin.config;
    this.settings = window.yodelImageAdmin.settings;

    this.initEventListeners();
  }

  private initEventListeners() {
    if (!this.media) return;

    this.media.view.Modal.prototype.on("open", this.handleOpen.bind(this));
  }

  public mount(container: HTMLElement, component: React.ReactNode) {
    if (this.root) {
      this.unmount();
    }

    this.root = createRoot(container);
    this.root.render(component);
  }

  public unmount() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private handleOpen() {
    const node = document.getElementById("yodel-image-generator");

    if (node) {
      this.mount(
        node,
        <Provider>
          <div className="flex flex-col h-full overflow-hidden">
            {/* <CreditMenu /> */}
            <div className="flex-1 px-5 py-6 overflow-auto">
              <Generator onSave={this.handleSave.bind(this)} />
            </div>
          </div>
        </Provider>
      );
    }
  }

  private async handleSave(image: OutputImage) {
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

      this.refreshAttachments();
      // const uploadUrl = new URL("/wp-admin/upload.php", window.location.origin);
      // uploadUrl.searchParams.append("item", saveResponse.id.toString());
      // : <a href="${uploadUrl.toString()}" target="_blank" rel="noopener noreferrer">View</a>

      toast.success(`Image saved successfully`);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Uh oh! Something went wrong while saving the image");
    }
  }

  private refreshAttachments() {
    if (this.media.frame.content.get() !== null) {
      this.media.frame.content.get().collection.props.set({
        ignore: +new Date(),
      });
      this.media.frame.content.get().options.selection.reset();
    } else {
      this.media.frame.library.props.set({ ignore: +new Date() });
    }
  }
}
