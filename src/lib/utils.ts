import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function stripHtml(html: string | undefined) {
  if (!html) return undefined;

  let result;
  if (typeof window === "undefined") {
    // If running on the server, use a regex as a fallback
    result = html.replace(/<[^>]*>?/gm, "");
  } else {
    // If running in the browser, use DOM manipulation
    const div = document.createElement("div");
    div.innerHTML = html;
    result = div.textContent || div.innerText || "";
  }

  // if empty string return undefined
  if (result.trim() === "") return undefined;

  return result;
}
export async function convertImageUrlToDataUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error("Failed to read the blob as Data URL."));
      }
    };
    reader.onerror = () => {
      reject(new Error("File reading has failed."));
    };
    reader.readAsDataURL(blob);
  });
}
