import { createRoot } from "react-dom/client";
import App from "./app";
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
const adminNode = document.getElementById(yodelImageAdmin.config.rootId)!;

if (adminNode) {
  const adminRoot = createRoot(adminNode);
  adminRoot.render(<App />);
}
