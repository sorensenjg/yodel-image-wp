import React from "react";
import { createRoot, Root } from "react-dom/client";
import { nanoid } from "nanoid";
import { saveImage } from "@/lib/wordpress";
import { Generator } from "@/components/generator";
import { Provider } from "@/components/provider";
import { CreditMenu } from "@/components/credit-menu";
import { toast } from "sonner";
import type { Config, Settings, OutputImage } from "@/types";

declare const wp: any;

export class GeneratorHandler {
  private root: Root | null = null;
  private media: any;
  private imageEdit: any;
  private config: Config;
  private settings: Settings;
  private title: string = `Generate Image <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

  constructor() {
    this.media = wp.media;
    this.imageEdit = window.imageEdit;
    this.config = window.yodelImageAdmin.config;
    this.settings = window.yodelImageAdmin.settings;

    this.initEventListeners();
    this.initModal();
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

  private initEventListeners() {
    if (!this.media) return;

    this.media.view.Modal.prototype.on("open", this.handleOpen.bind(this));

    window.addEventListener("beforeunload", () => {
      this.unmount();
    });
  }

  private initModal() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.createModal();
      });
    } else {
      // DOM is already ready
      this.createModal();
    }
  }

  private createModal() {
    const self = this;
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "yodel-image-button-group";

    const generateButton = document.createElement("button");
    generateButton.className = "yodel-image-button button";
    generateButton.innerHTML = this.title;

    const addMediaButton = document.querySelector(
      "#wp-media-grid > a.page-title-action"
    );

    if (!addMediaButton?.parentNode) return;

    addMediaButton.parentNode.replaceChild(buttonGroup, addMediaButton);
    buttonGroup.appendChild(addMediaButton);
    buttonGroup.appendChild(generateButton);

    // Create a modal view
    const modal = new this.media.view.Modal({
      controller: { trigger: () => {} },
    });

    // Create a modal content view
    const ModalContentView = this.media.View.extend({
      className:
        "yodel-image-generator-frame edit-attachment-frame mode-select hide-router",
      template: wp.template("yodel-image-generator"),
      render: function () {
        const data = { title: self.title };
        this.el.innerHTML = this.template(data);
        return this;
      },
    });

    generateButton.addEventListener("click", (event) => {
      event.preventDefault();
      modal.content(new ModalContentView());
      modal.open();
    });
  }

  private handleOpen() {
    const node = document.getElementById("yodel-image-generator");

    if (node) {
      this.mount(
        node,
        <Provider>
          <div className="flex flex-col h-full overflow-hidden">
            <CreditMenu className="yodel-image-credit-menu" />
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
      console.log(response);

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
    if (!this.media?.frame) return;

    const frame = this.media.frame;
    const content = frame.content?.get?.();

    if (content) {
      // Handle content view case
      if (content.collection?.props) {
        content.collection.props.set({ ignore: +new Date() });
      }
      if (content.options?.selection) {
        content.options.selection.reset();
      }
    } else if (frame.library?.props) {
      // Handle library view case
      frame.library.props.set({ ignore: +new Date() });
    }
  }
}
