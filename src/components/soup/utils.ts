import { Jimp, type JimpInstance } from "jimp";
import type { MimeType } from "./types";

/**
 * Processes the image with the provided Jimp manipulation.
 * @param editedImage - The current base64 image string.
 * @param mime - The MIME type of the image.
 * @param manipulate - A function that defines how to manipulate the Jimp image.
 * @returns A promise that resolves to the new base64 string of the manipulated image.
 */
export const processImage = async (
  image: string,
  mime: MimeType,
  manipulate?: (instance: JimpInstance) => void
): Promise<string> => {
  const instance = await Jimp.read(image);

  if (manipulate) {
    manipulate(instance as JimpInstance);
  }

  return instance.getBase64(mime, {
    quality: 100,
  } as any);
};

export const getImageAspectRatio = async (image: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = image;

    img.onload = () => {
      resolve(img.width / img.height);
    };

    img.onerror = (error) => {
      reject(new Error("Failed to get image aspect ratio"));
    };
  });
};
