export const types = ["Flux", "Ideogram"] as const;

export type ModelType = (typeof types)[number];

export interface Model<Type = string> {
  id: string;
  name: string;
  description: string;
  strengths?: string;
  type: Type;
  price?: number;
}

export const models: Model<ModelType>[] = [
  {
    id: "black-forest-labs/flux-schnell",
    type: "Flux",
    name: "Flux Schnell",
    description:
      "The fastest of the FLUX family of models, can generate high-quality images in roughly 1 second. Best for local development and personal use.",
    strengths: "Speed, price",
    price: 0.003,
  },
  {
    id: "black-forest-labs/flux-pro",
    type: "Flux",
    name: "Flux Pro",
    description:
      "State-of-the-art image generation with top of the line prompt following, visual quality, image detail and output diversity.",
    strengths:
      "Prompt following, visual quality, image detail, and output diversity",
    price: 0.055,
  },
  {
    id: "black-forest-labs/flux-1.1-pro",
    type: "Flux",
    name: "Flux Pro v1.1",
    description:
      "Faster, better FLUX Pro. Text-to-image model with excellent image quality, prompt adherence, and output diversity.",
    strengths:
      "Prompt following, visual quality, image detail, and output diversity",
    price: 0.04,
  },
  {
    id: "ideogram-ai/ideogram-v2",
    type: "Ideogram",
    name: "Ideogram v2",
    description:
      "An excellent image model with state of the art inpainting, prompt comprehension and text rendering",
    strengths: "Text rendering, art inpainting, prompt comprehension",
    price: 0.08,
  },
];
