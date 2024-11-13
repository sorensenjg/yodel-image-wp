import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";

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

export function generateSeedFromPrompt(prompt: string) {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash); // Use absolute value to avoid negative seeds
}

export function generateIterationSeed(
  originalSeed: number,
  index: number,
  temperature: number = 0.2
): number {
  const input = `${originalSeed}-${index}`;
  const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
  // Convert a portion of the hash to an integer
  const hashSeed = parseInt(hash.substring(0, 8), 16);

  // Ensure temperature is between 0 and 1
  const temp = Math.min(Math.max(temperature, 0), 1);

  // Blend the original seed and hashSeed based on temperature
  const blendedSeed = Math.floor(originalSeed * (1 - temp) + hashSeed * temp);

  return blendedSeed;
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
