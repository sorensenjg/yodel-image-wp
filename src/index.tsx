import React from "react";
import { createRoot, Root } from "react-dom/client";
import Admin from "./admin";
import Media from "./media";
import type { Config, Settings } from "@/types";

declare global {
  interface Window {
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
  // if existing root, unmount first
  unmountApp();

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

document.addEventListener("yodelImageMedia:content:rendered", () => {
  const mediaFrameContainer = document.getElementById("yodel-image-media");

  if (mediaFrameContainer) {
    mountApp(mediaFrameContainer, <Media />);
  }
});

window.addEventListener("beforeunload", () => {
  unmountApp();
});
