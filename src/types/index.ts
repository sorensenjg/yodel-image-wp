export type Config = {
  version: string;
  rootId: string;
  apiUrl: string;
  ajaxUrl: string;
  ajaxNonce: string;
  restUrl: string;
  restNonce: string;
  stripePublicKey: string;
};

export type Settings = {
  apiKey: string;
  svgSupport: boolean;
};

export type Image = {
  id: number;
  date: string;
  modified: string;
  title: {
    rendered: string;
  };
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  source_url: string;
  media_details: {
    filesize: number;
    width: number;
    height: number;
    file: string;
  };
  mime_type: string;
  featured_media: boolean;
  _embedded: {
    author: Array<{
      name: string;
    }>;
  };
};

export type InputModel =
  | "black-forest-labs/flux-schnell"
  | "black-forest-labs/flux-1.1-pro"
  | "ideogram-ai/ideogram-v2"
  | "recraft-ai/recraft-v3-svg";

export type OutputImage = {
  output: Blob;
  input: {
    model: InputModel;
    prompt: string;
    style?: string;
    aspectRatio?:
      | "1:1"
      | "2:3"
      | "3:2"
      | "3:4"
      | "4:3"
      | "4:5"
      | "5:4"
      | "9:16"
      | "16:9";
    outputFormat?: "png" | "jpg" | "webp";
    outputQuality?: number;
  };
  seed: number;
  isPreview: boolean;
};
