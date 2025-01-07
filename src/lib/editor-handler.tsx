import React from "react";
import { createRoot, Root } from "react-dom/client";
import { toast } from "sonner";
import { saveImage } from "@/lib/wordpress";
import { Editor } from "@/components/editor";
import { Provider } from "@/components/provider";
import type { Config, Settings } from "@/types";

declare const wp: any;

export class EditorHandler {
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

    // Get the post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("post");

    // Get the attachment data if we have a post ID
    if (postId) {
      const attachment = wp.media.attachment(postId);
      attachment.fetch();

      this.args = attachment.attributes;
    }

    this.initEditor();
    this.initExtendedViews();

    // Object.entries(this.media.view).forEach(([key, View]) => {
    //   if (typeof View !== "function" || !("extend" in View)) return;

    //   wp.media.view[key] = View.extend({
    //     initialize: function () {
    //       View.prototype.initialize.apply(this, arguments);
    //       console.log(`${key} initializing...`);
    //     },
    //   });
    // });
  }

  private initExtendedViews() {
    this.extendEditImageDetailsView();
  }

  private extendEditImageDetailsView() {
    const self = this;
    const View = this.media.view.EditImage.Details;

    if (typeof View !== "function") return;

    this.media.view.EditImage.Details = View.extend({
      initialize: function () {
        View.prototype.initialize.apply(this, arguments);

        this.on("prepare", function (args: any) {
          self.args = args;
        });
        this.on("ready", () => function () {});
      },
    });
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

  private component() {
    return (
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

  private createContainer() {
    const container = document.createElement("div");
    container.id = "yodel-image-editor";
    container.className = "yodel-image";
    return container;
  }

  private appendContainer(targetId: string) {
    const target = document.getElementById(targetId);

    if (target) {
      const container = this.createContainer();

      target.innerHTML = "";
      target.appendChild(container);
    }
  }

  private initEditor() {
    const self = this;

    if (this.imageEdit && this.imageEdit.open) {
      const originalOpen = this.imageEdit.open;

      this.imageEdit.open = function (
        id: string,
        nonce: string,
        ...args: any[]
      ) {
        const result = originalOpen.call(this, id, nonce, ...args);

        result.done(function (response: { success: boolean; data: any }) {
          if (response.success) {
            const defaultEditor = document.querySelector(".imgedit-wrap");

            if (defaultEditor) {
              defaultEditor.innerHTML = "";
            }

            self.appendContainer("image-editor-" + id);

            const container = document.getElementById("yodel-image-editor");

            if (container) {
              self.mount(container, self.component());
            }
          }
        });

        return result;
      };
    }
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

      this.imageEdit.close(this.args.id);

      setTimeout(() => {
        this.refreshAttachments(response.id);
      }, 250);

      toast.success(`Image saved successfully`);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Uh oh! Something went wrong while saving the image");
    }
  }

  private refreshAttachments(postId: number) {
    if (window.location.pathname === "/wp-admin/upload.php") {
      window.location.href = window.location.pathname;
    } else {
      window.location.href = `/wp-admin/post.php?post=${postId}&action=edit`;
    }
  }
}
