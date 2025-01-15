import { createRoot, Root } from "react-dom/client";
import { updateImage } from "@/lib/wordpress";
import { Provider } from "@/components/provider";
import { CreditMenu } from "@/components/credit-menu";
import { GenerateMetadata } from "@/components/generate-metadata";
import type { Config, Settings } from "@/types";
import { SERVICES } from "@/config";

declare const wp: any;

export class MetadataHandler {
  private readonly instances = new Map<
    string,
    { container: HTMLElement; root: Root }
  >();
  private readonly config: Config;
  private readonly settings: Settings;
  private attachment: Record<string, any> | null = null;

  constructor(config: Config, settings: Settings) {
    this.config = config;
    this.settings = settings;

    // Bind methods to ensure correct context
    this.handleBatchUpdate = this.handleBatchUpdate.bind(this);
    this.updateFieldValue = this.updateFieldValue.bind(this);

    this.extendFrame();
  }

  private extendFrame(): void {
    const self = this;
    const OriginalFrame = wp.media.view.MediaFrame.EditAttachments;

    wp.media.view.MediaFrame.EditAttachments = OriginalFrame.extend({
      initialize: function () {
        OriginalFrame.prototype.initialize.apply(this, arguments);
        this.on("close", () => self.handleClose());
        this.on("refresh", (args: any) => self.handleRefresh(args));
      },
      render: function () {
        OriginalFrame.prototype.render.apply(this, arguments);

        self.attachment = this.model.toJSON();
        if (this.model.attributes.mime.split("/")[0] === "image") {
          self.renderCreditMenu(this.$el);
          self.renderFieldGenerators(this.$el);
          self.renderGenerateAll(this.$el);
        }

        return this;
      },
    });
  }

  private mount(
    container: HTMLElement,
    id: string,
    renderContent: () => JSX.Element
  ): void {
    this.unmount(id);

    const root = createRoot(container);
    this.instances.set(id, { container, root });

    root.render(<Provider>{renderContent()}</Provider>);
  }

  private unmount(id: string): void {
    const instance = this.instances.get(id);
    if (instance) {
      instance.root.unmount();
      instance.container.remove();
      this.instances.delete(id);
    }
  }

  private createContainer(id: string, parent: HTMLElement): HTMLElement {
    const container = document.createElement("div");
    container.id = `yodel-image-metadata__${id}`;
    container.className = "yodel-image";
    parent.prepend(container);
    return container;
  }

  private renderCreditMenu(frameElement?: HTMLElement): void {
    const element = frameElement || wp.media.frame.$el;
    if (!element) return;

    const titleContainerElement =
      element[0].querySelector(".media-frame-title");
    if (!titleContainerElement) return;

    const container = this.createContainer(
      "credit-menu",
      titleContainerElement
    );
    this.mount(container, "credit-menu", () => <CreditMenu />);
  }

  private renderFieldGenerators(frameElement?: HTMLElement): void {
    const element = frameElement || wp.media.frame.$el;
    if (!element) return;

    const fieldSelectors = ["alt", "title", "caption", "description"];

    fieldSelectors.forEach((field) => {
      const el = element[0].querySelector(`span[data-setting='${field}']`);

      if (el) {
        el.classList.add("yodel-image-metadata__field");
        const container = this.createContainer(`field--${field}`, el);
        this.mount(container, field, () => (
          <GenerateMetadata
            image={this.getImageData() as any}
            services={this.getServicesForField(field)}
            buttonProps={this.getButtonProps("field")}
            onComplete={(values) => this.handleUpdate(values, field, container)}
          />
        ));
      }
    });
  }

  private renderGenerateAll(frameElement?: HTMLElement): void {
    const element = frameElement || wp.media.frame.$el;
    if (!element) return;

    const settingsElement = element[0].querySelector(".settings");
    if (!settingsElement) return;

    const id = "generate-all";
    const container = this.createContainer(id, settingsElement);
    this.mount(container, id, () => (
      <GenerateMetadata
        image={this.getImageData() as any}
        services={Object.values(SERVICES)}
        buttonProps={this.getButtonProps("generate-all")}
        onComplete={this.handleBatchUpdate}
      />
    ));
  }

  private getImageData(): Record<string, any> {
    if (!this.attachment) {
      throw new Error("Attachment not initialized");
    }
    return { ...this.attachment, source_url: this.attachment.url };
  }

  private getServicesForField(field: string): any[] {
    const serviceKey = field === "alt" ? "alt_text" : field;
    return [SERVICES[serviceKey as keyof typeof SERVICES]];
  }

  private getButtonProps(
    context: "field" | "generate-all"
  ): Record<string, any> {
    return context === "field"
      ? {
          className: "absolute top-1 right-1 w-6 h-6 p-0",
          variant: "ghost",
          size: "icon-xs",
        }
      : {
          className: "min-[901px]:ml-[34.5%]",
          title: "Generate Metadata",
          variant: "outline",
        };
  }

  private async handleUpdate(
    values: Record<string, string>,
    field: string,
    container: HTMLElement
  ): Promise<void> {
    const fieldKey = field === "alt" ? "alt_text" : field;
    const value = values[fieldKey];
    const inputElement = this.getInputElement(container);

    if (inputElement) {
      inputElement.value = value;
      await updateImage(this.attachment!.id, { [fieldKey]: value });
    }
  }

  private async handleBatchUpdate(
    values: Record<string, string>
  ): Promise<void> {
    Object.entries(values).forEach(([key, value]) => {
      const field = key === "alt_text" ? "alt" : key;
      this.updateFieldValue(field, value);
    });
    await updateImage(this.attachment!.id, values);
  }

  private getInputElement(container: HTMLElement): HTMLInputElement | null {
    return container.parentElement?.querySelector("input, textarea") || null;
  }

  private updateFieldValue(field: string, value: string): void {
    const isLongText = ["alt", "caption", "description"].includes(field);
    const inputElement = document.querySelector(
      `.yodel-image-metadata__field[data-setting=${field}] ${
        isLongText ? "textarea" : "input"
      }`
    );

    if (inputElement) {
      (inputElement as HTMLInputElement | HTMLTextAreaElement).value = value;
    }
  }

  private handleClose(): void {
    this.instances.forEach(({ root, container }) => {
      root.unmount();
      container.remove();
    });
    this.instances.clear();
  }

  private handleRefresh(args: any): void {
    this.attachment = args.toJSON();
    this.instances.clear();

    if (args.attributes.mime.split("/")[0] === "image") {
      this.renderFieldGenerators();
      this.renderGenerateAll();
    }
  }
}
