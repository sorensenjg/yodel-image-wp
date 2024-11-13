import { JimpMime } from "jimp";

export type MimeType = (typeof JimpMime)[keyof typeof JimpMime];

export type Image = {
  url: string;
  mime: MimeType;
  width?: number;
  height?: number;
  size?: number;
};

export type ImageOperation = {
  type: "crop" | "rotate" | "flip" | "scale";
  payload: any;
};
