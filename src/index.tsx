import React from "react";
import { createRoot, Root } from "react-dom/client";
import Admin from "./admin";
import Media from "./media";
import type { Config, Settings } from "@/types";

import { GeneratorHandler } from "@/lib/generator-handler";
import { EditImageHandler } from "@/lib/edit-image-handler";

declare const wp: any;
declare global {
  interface Window {
    imageEdit: any;
    yodelImageAdmin: {
      config: Config;
      settings: Settings;
    };
  }
}

const { yodelImageAdmin } = window;
const rootId = yodelImageAdmin.config.rootId;
let root: Root | null = null;

const mountApp = (container: HTMLElement, component: React.ReactNode) => {
  if (root) {
    unmountApp();
  }

  root = createRoot(container);
  root.render(component);
};

const unmountApp = () => {
  if (root) {
    root.unmount();
    root = null;
  }
};

const adminContainer = document.getElementById(rootId);
if (adminContainer) {
  mountApp(adminContainer, <Admin />);
}

document.addEventListener("yodel-image-select:content:rendered", () => {
  const node = document.getElementById("yodel-image-select-media-content");
  if (node) {
    mountApp(node, <Media />);
  }
});

document.addEventListener("yodel-image-post:content:rendered", () => {
  const node = document.getElementById("yodel-image-post-media-content");
  if (node) {
    mountApp(node, <Media />);
  }
});

document.addEventListener("yodel-image-modal:closed", () => {
  unmountApp();
});

window.addEventListener("beforeunload", () => {
  unmountApp();
});

new GeneratorHandler();
new EditImageHandler();
