import React from "react";
import { createRoot, Root } from "react-dom/client";
import { toast } from "sonner";
import { saveImage } from "@/lib/wordpress";
import { Editor } from "@/components/editor";
import { Provider } from "@/components/provider";
import type { Config, Settings } from "@/types";

declare const wp: any;

export class EditImageHandler {
  private root: Root | null = null;
  private media: any;
  private imageEdit: any;
  private config: Config;
  private settings: Settings;
  private args: any = null;

  constructor() {
    this.media = wp.media;
    this.imageEdit = window.imageEdit;
    this.config = window.yodelImageAdmin.config;
    this.settings = window.yodelImageAdmin.settings;

    this.initEventListeners();
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

    this.media.view.EditImage.Details.prototype.on(
      "prepare",
      this.handlePrepare.bind(this)
    );
    this.media.view.EditImage.Details.prototype.on(
      "ready",
      this.handleReady.bind(this)
    );
  }

  private handlePrepare(args: any) {
    this.args = args;
  }

  private handleReady() {
    const node = document.getElementById("yodel-image-editor");

    if (node) {
      this.mount(
        node,
        <Provider>
          <Editor
            post={this.args}
            media={this.media}
            imageEdit={this.imageEdit}
            onProcess={this.handleProcess.bind(this)}
          />
        </Provider>
      );
    }

    // Optionally reset args
    // this.args = null;
  }

  private async handleProcess(imageWriterResult: any) {
    const file = imageWriterResult.dest;

    if (!file) {
      toast.error("No image available to save");
      return;
    }

    try {
      const response = await saveImage(file);

      if (!response.id) {
        throw new Error("Invalid response saving image");
      }

      setTimeout(() => {
        this.refreshAttachments();
      }, 500);

      toast.success(`Image saved successfully`);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Uh oh! Something went wrong while saving the image");
    }
  }

  private refreshAttachments() {
    // window.location.reload without params
    window.location.href = window.location.pathname;

    // if (this.media.frame.content.get() !== null) {
    //   this.media.frame.content.get().collection.props.set({
    //     ignore: +new Date(),
    //   });
    //   this.media.frame.content.get().options.selection.reset();
    // } else {
    //   this.media.frame.library.props.set({ ignore: +new Date() });
    // }
  }
}
