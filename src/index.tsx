import { createRoot } from "react-dom/client";
import App from "./app";
import type { Config } from "@/types";

declare global {
  interface Window {
    yodelImageAdmin: {
      config: Config;
    };
  }
}

const { yodelImageAdmin } = window;
const adminNode = document.getElementById(yodelImageAdmin.config.rootId)!;

if (adminNode) {
  const adminRoot = createRoot(adminNode);
  adminRoot.render(<App />);
}
