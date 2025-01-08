import { useRef, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  // ImageUpIcon,
  Loader2 as LoadingIcon,
  ChevronsUpDown,
  CircleHelpIcon as HelpIcon,
  CircleFadingArrowUp as UpscaleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCredits,
  useServices,
  useGenerateImage,
  useUpscaleImage,
  useGeneratePrompt,
} from "@/lib/api";
import {
  generateSeedFromPrompt,
  generateIterationSeed,
  convertFileToBase64,
} from "@/lib/utils";
import { addImage, getAllImages, clearImages } from "@/lib/indexed-db";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  // TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditConfirmDialog } from "@/components/credit-confirm-dialog";
// import { CreditMenu } from "@/components/credit-menu";
import { ImageStyleSelector } from "./components/image-style-selector";
import { AspectRatioSelector } from "./components/aspect-ratio-selector";
import { OutputFormatSelector } from "./components/output-format-selector";
import { OutputQualitySelector } from "./components/output-quality-selector";
import { OutputQuantitySelector } from "./components/output-quantity-selector";
import { ModelSelector } from "./components/model-selector";
// import { models, types } from "./data/models";

import type { OutputImage } from "@/types";

function usePersistReactHookForm(form: any) {
  useEffect(() => {
    const persistedData = load();

    if (persistedData) {
      form.reset(persistedData);
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = form.watch((value: any) => {
      localStorage.setItem("yodel-image-form-state", JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Function to load persisted form data
  const load = () => {
    const savedData = localStorage.getItem("yodel-image-form-state");

    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse persisted form data:", e);
        return null;
      }
    }
    return null;
  };

  const reset = () => {
    localStorage.removeItem("yodel-image-form-state");
  };

  return reset;
}

function InitialDisplay({
  focusPrompt,
  onComplete,
}: {
  focusPrompt: () => void;
  onComplete: (prompt: string) => void;
}) {
  const [loadingText, setLoadingText] = useState("Analyzing Image");
  const { data: credits, status: creditsStatus } = useCredits();
  const { data: services, status: servicesStatus } = useServices();
  const mutation = useGeneratePrompt();
  const { register, watch, reset, setValue, handleSubmit, formState } = useForm(
    {
      defaultValues: {
        image: null,
      },
    }
  );
  const imageValue = watch("image");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingText("Generating Prompt");
    }, 8000);
    return () => clearTimeout(timer);
  }, [formState.isSubmitting]);

  const onSubmit = async (values: any) => {
    const image = values.image;

    if (!image) {
      toast.error("No image to create prompt from.");
      return;
    }

    try {
      const base64Image = await convertFileToBase64(image);
      const output = await mutation.mutateAsync({
        image: base64Image,
      });

      onComplete(output);
    } catch (error) {
      console.error("Error generating prompt from image:", error);
      toast.error("Failed to generate prompt from image.");
    }

    reset();
  };

  if (creditsStatus === "pending" || servicesStatus === "pending") {
    return (
      <div className="flex items-center justify-center w-full h-full border border-dashed rounded">
        <LoadingIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const service = services?.find((service: any) => service.id === "prompt");

  const hasInsufficientCredits = credits < service.cost;

  return (
    <div className="w-full h-full border border-dashed rounded">
      {formState.isSubmitting ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl font-bold inline-flex items-center gap-2">
            <LoadingIcon className="h-8 w-8 animate-spin" /> {loadingText}
          </div>
        </div>
      ) : (
        <>
          <form className="w-full h-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="text-center items-center justify-center max-w-lg">
                {/* <div className="rounded-xl bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#FFC373] from-[28%] via-[#FF8E71] via-[70%] to-[#FF5F6F] sm:bg-[linear-gradient(145deg,var(--tw-gradient-stops))]">
                  <ImageUpIcon className="h-24 w-24" strokeWidth={1} />
                </div> */}
                <h1 className="text-4xl font-bold space-x-2 mb-3">
                  Get Started with
                  <br />
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-auto h-10"
                      width="340"
                      height="122"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 340 122"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M39.296 116.792c-3.67 0-5.504-1.195-5.504-3.584V67.512L1.28 7.48C.683 6.37.64 5.347 1.152 4.408c.512-.939 1.621-1.835 3.328-2.688C6.101.867 7.424.44 8.448.44c1.11-.085 2.048.597 2.816 2.048l28.032 52.864 28.16-52.864c.853-1.45 1.792-2.133 2.816-2.048 1.024 0 2.347.427 3.968 1.28 1.707.853 2.773 1.75 3.2 2.688.512.939.512 1.963 0 3.072L44.928 67.64v45.568c0 2.389-1.877 3.584-5.632 3.584Zm66.714.64c-5.717 0-10.837-1.451-15.36-4.352-4.437-2.901-7.936-6.912-10.496-12.032-2.56-5.205-3.84-11.221-3.84-18.048 0-5.035.725-9.643 2.176-13.824 1.45-4.181 3.499-7.808 6.144-10.88 2.73-3.072 5.888-5.461 9.472-7.168 3.584-1.707 7.552-2.56 11.904-2.56 5.717 0 10.795 1.493 15.232 4.48 4.437 2.901 7.936 6.955 10.496 12.16 2.56 5.12 3.84 11.008 3.84 17.664 0 4.01-.469 7.765-1.408 11.264-.939 3.499-2.304 6.699-4.096 9.6-1.707 2.816-3.797 5.248-6.272 7.296-2.389 2.048-5.12 3.627-8.192 4.736-2.987 1.109-6.187 1.664-9.6 1.664Zm0-10.24c2.816 0 5.333-.555 7.552-1.664 2.219-1.195 4.139-2.859 5.76-4.992 1.621-2.133 2.859-4.693 3.712-7.68.853-2.987 1.28-6.315 1.28-9.984 0-4.864-.768-9.088-2.304-12.672-1.451-3.67-3.541-6.485-6.272-8.448-2.731-1.963-5.973-2.944-9.728-2.944-2.731 0-5.248.555-7.552 1.664-2.304 1.11-4.267 2.773-5.888 4.992-1.621 2.133-2.859 4.693-3.712 7.68-.853 2.901-1.28 6.187-1.28 9.856 0 4.864.768 9.13 2.304 12.8 1.536 3.584 3.67 6.4 6.4 8.448 2.73 1.963 5.973 2.944 9.728 2.944Zm38.514-39.936c-3.925 0-8.277-.64-13.056-1.92-4.779-1.365-9.941-3.499-15.488-6.4-.768-.427-1.237-1.11-1.408-2.048-.256-1.024-.213-2.005.128-2.944.256-1.024.725-1.75 1.408-2.176.683-.512 1.536-.512 2.56 0a51.023 51.023 0 0 0 8.192 3.712 62.366 62.366 0 0 0 8.96 2.176c3.072.512 6.059.768 8.96.768 2.816 0 5.675-.213 8.576-.64 2.901-.427 5.632-1.067 8.192-1.92 2.645-.853 4.864-1.877 6.656-3.072 1.024-.768 1.92-.683 2.688.256.853.853 1.365 1.963 1.536 3.328.171 1.365-.384 2.475-1.664 3.328-4.096 2.645-8.448 4.565-13.056 5.76-4.523 1.195-8.917 1.792-13.184 1.792Zm32.256 49.92c-4.779 0-8.96-1.195-12.544-3.584-3.584-2.389-6.4-5.931-8.448-10.624-2.048-4.693-3.072-10.581-3.072-17.664 0-4.437.427-8.533 1.28-12.288.853-3.84 2.091-7.253 3.712-10.24 1.621-3.072 3.584-5.632 5.888-7.68a25.154 25.154 0 0 1 8.064-4.864c3.072-1.11 6.485-1.664 10.24-1.664 2.645 0 5.376.384 8.192 1.152a38.744 38.744 0 0 1 8.064 3.2V3.896c0-1.11.469-1.92 1.408-2.432.939-.597 2.347-.896 4.224-.896 1.877 0 3.243.299 4.096.896.853.512 1.28 1.323 1.28 2.432v93.952c0 3.755.555 6.315 1.664 7.68 1.195 1.365 3.371 2.048 6.528 2.048.939 0 1.621.512 2.048 1.536.512.939.683 2.048.512 3.328-.085 1.195-.555 2.261-1.408 3.2-.768 1.024-1.963 1.536-3.584 1.536-2.304 0-4.395-.256-6.272-.768-1.877-.427-3.499-1.195-4.864-2.304-1.365-1.109-2.475-2.475-3.328-4.096-.853-1.707-1.408-3.797-1.664-6.272l-.128-2.176c-1.963 3.925-4.139 7.04-6.528 9.344-2.389 2.304-4.907 3.925-7.552 4.864-2.56.939-5.163 1.408-7.808 1.408Zm1.664-10.24c2.645 0 5.163-.683 7.552-2.048 2.389-1.451 4.608-3.627 6.656-6.528 2.133-2.987 3.968-6.912 5.504-11.776V63.16c-2.645-1.707-5.248-2.859-7.808-3.456a28.272 28.272 0 0 0-7.552-1.024c-2.304 0-4.437.341-6.4 1.024a14.508 14.508 0 0 0-5.248 3.2c-1.451 1.365-2.731 3.115-3.84 5.248-1.024 2.048-1.835 4.48-2.432 7.296-.512 2.73-.768 5.888-.768 9.472 0 4.352.512 8.192 1.536 11.52 1.024 3.328 2.603 5.931 4.736 7.808 2.133 1.792 4.821 2.688 8.064 2.688Zm36.432 10.24c-1.195 0-2.048-.512-2.56-1.536-.597-.939-.811-2.005-.64-3.2.085-1.28.597-2.389 1.536-3.328.939-1.024 2.304-1.536 4.096-1.536 1.707 0 3.755-.469 6.144-1.408 2.304-.939 4.821-2.261 7.552-3.968 2.816-1.707 5.717-3.712 8.704-6.016 1.109-.939 2.133-1.237 3.072-.896 1.024.256 1.792.853 2.304 1.792.597.939.853 2.005.768 3.2 0 1.109-.512 2.091-1.536 2.944-3.755 2.901-7.424 5.419-11.008 7.552-3.584 2.048-6.955 3.627-10.112 4.736s-5.931 1.664-8.32 1.664Zm25.472-20.864c4.523-3.157 8.448-6.101 11.776-8.832 3.328-2.816 6.059-5.461 8.192-7.936 2.219-2.56 3.883-4.992 4.992-7.296 1.109-2.39 1.664-4.65 1.664-6.784 0-2.39-.683-4.096-2.048-5.12-1.28-1.024-2.944-1.536-4.992-1.536-2.133 0-4.139.597-6.016 1.792-1.792 1.195-3.371 2.859-4.736 4.992-1.365 2.133-2.432 4.608-3.2 7.424-.768 2.73-1.152 5.632-1.152 8.704 0 4.267.555 8.021 1.664 11.264 1.109 3.243 2.645 5.973 4.608 8.192 2.048 2.219 4.395 3.883 7.04 4.992 2.731 1.024 5.717 1.536 8.96 1.536 1.28 0 2.219.512 2.816 1.536.597.939.896 2.048.896 3.328 0 1.195-.299 2.261-.896 3.2-.597.939-1.536 1.408-2.816 1.408-7.595 0-13.867-1.493-18.816-4.48-4.949-2.987-8.661-7.083-11.136-12.288-2.389-5.29-3.584-11.307-3.584-18.048 0-4.693.64-9.088 1.92-13.184 1.28-4.096 3.157-7.68 5.632-10.752 2.475-3.157 5.419-5.59 8.832-7.296 3.413-1.707 7.253-2.56 11.52-2.56 3.243 0 6.101.683 8.576 2.048 2.56 1.28 4.565 3.115 6.016 5.504 1.451 2.39 2.176 5.163 2.176 8.32 0 2.901-.555 5.76-1.664 8.576-1.109 2.73-2.859 5.547-5.248 8.448-2.389 2.901-5.419 5.93-9.088 9.088-3.669 3.072-8.021 6.357-13.056 9.856l-8.832-4.096Zm26.788 20.864c-1.621 0-2.816-.469-3.584-1.408-.768-.939-1.152-2.005-1.152-3.2 0-1.28.384-2.389 1.152-3.328.768-1.024 1.963-1.536 3.584-1.536 4.267 0 8.32-.683 12.16-2.048 3.84-1.451 7.509-3.456 11.008-6.016 3.499-2.645 6.784-5.76 9.856-9.344 3.072-3.584 5.888-7.51 8.448-11.776a117.173 117.173 0 0 0 6.912-13.44 111.17 111.17 0 0 0 5.12-14.72 110.13 110.13 0 0 0 3.2-15.232c.768-5.12 1.152-10.07 1.152-14.848 0-1.195.555-2.09 1.664-2.688 1.109-.683 2.389-1.024 3.84-1.024s2.731.341 3.84 1.024c1.109.597 1.664 1.493 1.664 2.688 0 3.925-.427 8.32-1.28 13.184-.768 4.779-1.963 9.856-3.584 15.232a135.29 135.29 0 0 1-5.76 16.128 130.48 130.48 0 0 1-8.064 15.744c-2.987 5.12-6.272 9.899-9.856 14.336-3.584 4.437-7.509 8.32-11.776 11.648-4.181 3.243-8.661 5.845-13.44 7.808-4.779 1.877-9.813 2.816-15.104 2.816Zm49.024 0c-2.133 0-4.011-.299-5.632-.896-1.621-.597-2.944-1.451-3.968-2.56-.939-1.109-1.664-2.517-2.176-4.224-.427-1.707-.64-3.627-.64-5.76V25.272c0-8.619 1.365-14.976 4.096-19.072 2.731-4.096 6.912-6.144 12.544-6.144 3.499 0 6.4.768 8.704 2.304 2.304 1.536 4.011 3.797 5.12 6.784C335.403 12.045 336 15.757 336 20.28c0 1.621-.555 2.816-1.664 3.584-1.109.768-2.389 1.152-3.84 1.152s-2.731-.384-3.84-1.152c-1.109-.768-1.664-1.963-1.664-3.584 0-2.39-.171-4.267-.512-5.632-.341-1.45-.896-2.517-1.664-3.2-.683-.768-1.579-1.152-2.688-1.152-1.195 0-2.219.47-3.072 1.408-.768.939-1.365 2.56-1.792 4.864-.341 2.304-.512 5.461-.512 9.472v76.288c0 1.195.128 2.176.384 2.944.341.768.768 1.323 1.28 1.664a3.809 3.809 0 0 0 1.92.512c.768 0 1.451-.128 2.048-.384a7.388 7.388 0 0 0 1.92-1.408 39.181 39.181 0 0 0 1.792-1.92c.597-.597 1.28-.768 2.048-.512.853.171 1.664.555 2.432 1.152.853.768 1.323 1.579 1.408 2.432.171.768.043 1.536-.384 2.304a14.835 14.835 0 0 1-3.584 4.352 15.411 15.411 0 0 1-4.736 2.688 13.054 13.054 0 0 1-5.12 1.024Z"
                        fill="currentColor"
                      />
                    </svg>
                    Image
                  </span>
                </h1>
                <p className="prose prose-lg">
                  Enter a description of the image you want to generate in the{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      focusPrompt();
                    }}
                  >
                    Prompt
                  </a>
                  , or upload an image to generate a prompt, capturing the
                  desired look and feel to use as a starting point.
                </p>
                <Button className="mt-8" type="button" role="button" asChild>
                  <label>
                    Upload Image
                    <input
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      {...register("image")}
                      onChange={(event) => {
                        // @ts-ignore
                        setValue("image", event.target.files?.[0] || null);
                      }}
                      disabled={hasInsufficientCredits}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </form>
          {imageValue && (
            <CreditConfirmDialog
              title="Generate Prompt"
              description="This will generate a prompt based on your uploaded image."
              services={[
                {
                  name: service.name,
                  cost: service.cost,
                  quantity: 1,
                },
              ]}
              onConfirm={() => {
                handleSubmit(onSubmit)();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

const formSchema = z.object({
  prompt: z
    .string({
      required_error: "A prompt is required.",
    })
    .min(9, {
      message:
        "Your prompt must be at least 9 characters long or about 3 words.",
    }),
  style: z.string().optional(),
  model: z.enum([
    "black-forest-labs/flux-schnell",
    "black-forest-labs/flux-1.1-pro",
    "ideogram-ai/ideogram-v2",
    "recraft-ai/recraft-v3-svg",
  ]),
  aspectRatio: z.enum([
    "1:1",
    "3:2",
    "4:3",
    "5:4",
    "16:9",
    "2:3",
    "3:4",
    "4:5",
    "9:16",
  ]),
  outputFormat: z.enum(["jpg", "png", "webp"]),
  outputQuality: z.number().min(1).max(100),
  outputQuantity: z.number().min(1).max(4),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
  prompt: "",
  style: undefined,
  model: "black-forest-labs/flux-1.1-pro",
  aspectRatio: "1:1",
  outputFormat: "jpg",
  outputQuality: 100,
  outputQuantity: 4,
};

interface GeneratorProps {
  onSave: (image: OutputImage) => void;
}

export function Generator({ onSave }: GeneratorProps) {
  const { data: credits, status: creditsStatus } = useCredits();
  const { data: services, status: servicesStatus } = useServices();
  const generateMutation = useGenerateImage();
  const upscaleMutation = useUpscaleImage();
  const [images, setImages] = useState<OutputImage[]>([]);
  const [selected, setSelected] = useState<OutputImage | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null); // Create ref for Prompt

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const resetPersistedValues = usePersistReactHookForm(form);

  const modelValue = form.watch("model");
  const outputQuantityValue = form.watch("outputQuantity");
  const [skeletons, setSkeletons] = useState(0);
  useEffect(() => setSkeletons(outputQuantityValue), [outputQuantityValue]);

  // Load images from IndexedDB on component mount
  useEffect(() => {
    async function fetchPersisted() {
      try {
        const persistedImages = await getAllImages();
        setImages(persistedImages.reverse());
      } catch (error) {
        console.error("Failed to load images from IndexedDB:", error);
      }
    }

    fetchPersisted();
  }, []);

  // Save images to IndexedDB whenever they change
  useEffect(() => {
    async function persistImages() {
      try {
        // Optionally, you can clear and re-add all images for simplicity
        await clearImages();
        await Promise.all(images.map((img) => addImage(img)));
      } catch (error) {
        console.error("Failed to save images to IndexedDB:", error);
      }
    }

    persistImages();
  }, [images]);

  async function onSubmit(
    values: FormData,
    action: "generate" | "iterate" | "upscale"
  ) {
    try {
      switch (action) {
        case "generate":
          await handleGenerate(values);
          setSelected(null);
          break;

        case "iterate":
          await handleIterate(selected, values);
          setSelected(null);
          break;

        case "upscale":
          await handleUpscale(selected, values);
          setSelected(null);
          break;

        default:
          throw new Error("Invalid action");
      }

      setSkeletons(outputQuantityValue);
    } catch (error: any) {
      console.error("Error processing image(s):", error);
      toast.error(error.message || "Failed to process image(s)");
    }
  }

  async function handleGenerate(values: FormData) {
    try {
      for (let i = 0; i < values.outputQuantity; i++) {
        try {
          const baseSeed = generateSeedFromPrompt(values.prompt);
          const uniqueSeed = baseSeed + Math.floor(Math.random() * 1000000);

          const output = await generateMutation.mutateAsync({
            model: values.model,
            prompt: values.prompt,
            style: values.style,
            aspectRatio: values.aspectRatio,
            outputFormat: values.outputFormat,
            outputQuality: values.outputQuality,
            seed: uniqueSeed,
          });

          const newImage: OutputImage = {
            output,
            input: values,
            seed: uniqueSeed,
            isPreview: true,
          };

          // Update the state to include the newly generated image
          setSkeletons((prev) => prev - 1);
          setImages((prev) => [newImage, ...prev]);

          // Provide feedback for each successful image generation
          toast.success(`Image ${i + 1} generated successfully`);
        } catch (error: any) {
          console.error(`Error generating image ${i + 1}:`, error);
          const reason =
            error.message?.split(":").pop()?.trim() || "Unknown error";
          toast.error(`Failed to generate Image ${i + 1}: ${reason}`);
        }
      }

      toast.success("Image generation process completed");
    } catch (error: any) {
      console.error("Unexpected error during image generation:", error);
      toast.error(
        `An unexpected error occurred: ${error.message || "Unknown error"}`
      );
    }
  }

  async function handleIterate(
    selected: OutputImage | null | undefined,
    values: FormData
  ) {
    if (!selected) {
      toast.error("No selected image available to iterate");
      return;
    }

    try {
      for (let i = 0; i < values.outputQuantity; i++) {
        try {
          const iterationSeed = generateIterationSeed(
            selected.seed,
            i + 1,
            0.1
          );

          const output = await generateMutation.mutateAsync({
            model: selected.input.model,
            prompt: values.prompt,
            style: values.style,
            aspectRatio: values.aspectRatio,
            outputFormat: values.outputFormat,
            outputQuality: values.outputQuality,
            seed: iterationSeed,
          });

          const newImage: OutputImage = {
            output,
            input: {
              ...values,
              model: selected.input.model,
              prompt: values.prompt,
            },
            seed: iterationSeed,
            isPreview: true,
          };

          // Update the state to include the newly generated image
          setSkeletons((prev) => prev - 1);
          setImages((prev) => [newImage, ...prev]);

          // Provide feedback for each successful image generation
          toast.success(`Image ${i + 1} iterated successfully`);
        } catch (error: any) {
          console.error(`Error iterating image ${i + 1}:`, error);
          const reason =
            error.message?.split(":").pop()?.trim() || "Unknown error";
          toast.error(`Failed to iterate image ${i + 1}: ${reason}`);
        }
      }

      toast.success("Image iteration process completed");
    } catch (error: any) {
      console.error("Unexpected error during image iteration:", error);
      toast.error(
        `An unexpected error occurred: ${error.message || "Unknown error"}`
      );
    }
  }

  async function handleUpscale(
    selected: OutputImage | null | undefined,
    values: FormData
  ) {
    if (!selected) {
      toast.error("No selected image available to upscale");
      return;
    }

    try {
      const blob = selected.output;
      const filename = `${nanoid()}.${selected.input.outputFormat}`;
      const file = new File([blob], filename, { type: blob.type });
      const base64Image = await convertFileToBase64(file);

      const output = await upscaleMutation.mutateAsync({
        image: base64Image,
        prompt: selected.input.prompt,
      });

      const upscaledImage = {
        output,
        input: selected.input,
        seed: selected.seed,
        isPreview: false,
      } as OutputImage;

      setImages((prev) => [upscaledImage, ...prev]);
      toast.success("Image upscaled successfully");

      // Automatically save the upscaled image
      // await handleSave(upscaledImage);
    } catch (error: any) {
      console.error("Error upscaling image:", error);
      const reason = error.response?.data.error
        ? error.response?.data.error.split(":").reverse()[0]
        : "";
      toast.error(`Failed to upscale image: ${reason}`);
    }
  }

  const handleReset = () => {
    form.reset(defaultValues);
    resetPersistedValues();
    setImages([]);
    setSelected(null);
    clearImages().catch((error) =>
      console.error("Failed to clear images from IndexedDB:", error)
    );
  };

  const handleFocusPrompt = () => {
    if (promptRef.current) {
      promptRef.current.focus();
    }
  };

  if (creditsStatus === "pending" || servicesStatus === "pending") {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isSelectedProduction = selected && !selected.isPreview;

  const selectedModel = services?.find(
    (service: any) => service.id === modelValue
  );
  const upscaleModel = services?.find(
    (service: any) => service.id === "batouresearch/magic-image-refiner"
  );

  const hasInsufficientCredits =
    credits < selectedModel.cost * outputQuantityValue;

  return (
    <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_300px]">
      <div className="flex flex-col space-y-4 pb-6 md:order-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              onSubmit(values, "generate")
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                      <FormLabel className="flex items-center gap-2">
                        Prompt <HelpIcon className="h-4 w-4" />
                      </FormLabel>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="prose w-[320px] text-sm"
                      side="left"
                    >
                      <p>
                        The <b>Prompt</b> is used to describe the image you want
                        to create. It should be as detailed as possible to help
                        instruct the generation process.
                      </p>
                      <p>
                        For models that support text generation, any words you
                        want to appear in the image itself, should be entered in
                        "double quotes."
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                  <FormControl>
                    <Textarea
                      className="h-32"
                      // placeholder='black forest gateau cake spelling out the words "Yodel Image", tasty, food photography'
                      disabled={!!isSelectedProduction}
                      {...field}
                      ref={promptRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ImageStyleSelector />
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button className="w-full justify-start px-0" variant="link">
                  Advanced Settings
                  <ChevronsUpDown className="h-4 w-4 ml-2" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 pt-4">
                {!selected && (
                  <ModelSelector
                    // types={types}
                    models={
                      services
                        ? services.filter(
                            (service: any) =>
                              service.category === "ai/text-to-image"
                          )
                        : []
                    }
                  />
                )}
                <AspectRatioSelector />
                <OutputFormatSelector />
                <OutputQualitySelector />
                <OutputQuantitySelector />
              </CollapsibleContent>
            </Collapsible>
            <div className="flex justify-end items-center space-x-2 !mt-12">
              {form.formState.isSubmitting && (
                <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    disabled={form.formState.isSubmitting}
                  >
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your current image(s) and reset your prompt and input.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      type="button"
                      variant="destructive"
                      onClick={handleReset}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* {hasSufficientCredits ? (
                        <Button
                          type="button"
                          disabled={form.formState.isSubmitting}
                        >
                          {selected && !isSelectedProduction
                            ? "Iterate"
                            : "Generate"}
                        </Button>
                      ) : (
                        <CreditMenu />
                      )} */}

              <div className="flex-1 flex justify-end items-center space-x-2">
                {
                  // (images.length === 0 || images.every((image) => image.isPreview))
                  (selected || images.length > 0 || images.length === 0) && (
                    <CreditConfirmDialog
                      // tooltip="Purchase credits to continue"
                      title={
                        selected ? "Iterate Selection" : "Generate Previews"
                      }
                      description={
                        selected
                          ? "This will generate iterations of your selected preview image."
                          : "This will generate image preview(s) based on your prompt and input."
                      }
                      services={[
                        {
                          name: selectedModel?.name,
                          cost: selectedModel?.cost,
                          quantity: form.getValues("outputQuantity"),
                        },
                      ]}
                      onConfirm={() => {
                        form.handleSubmit(async (values) => {
                          await onSubmit(
                            values,
                            selected ? "iterate" : "generate"
                          );
                        })();
                      }}
                    >
                      <Button
                        type="button"
                        className="flex-1"
                        variant="secondary"
                        disabled={
                          form.formState.isSubmitting || hasInsufficientCredits
                        }
                      >
                        {selected ? "Iterate" : "Generate"}
                      </Button>
                    </CreditConfirmDialog>
                  )
                }
                {selected && !isSelectedProduction && (
                  <CreditConfirmDialog
                    title="Upscale Selection"
                    description="This will upscale your selected preview image to production quality."
                    services={[
                      {
                        name: upscaleModel?.name,
                        cost: upscaleModel?.cost,
                        quantity: 1,
                      },
                    ]}
                    onConfirm={() => {
                      // bypass form validation
                      // await onSubmit(form.getValues(), "upscale");
                      form.handleSubmit(
                        async () => await onSubmit(form.getValues(), "upscale")
                      )();
                    }}
                  >
                    <Button
                      type="button"
                      className="flex-1"
                      variant="secondary"
                      disabled={
                        form.formState.isSubmitting || hasInsufficientCredits
                      }
                    >
                      Upscale
                    </Button>
                  </CreditConfirmDialog>
                )}
              </div>
            </div>
            {selected && (
              <Button
                type="button"
                className="w-full"
                onClick={() => onSave(selected)}
              >
                Save Image
              </Button>
            )}
            {hasInsufficientCredits && (
              <FormMessage className="text-center !mt-12">
                You do not have enough
                <br /> credits to continue
              </FormMessage>
            )}
          </form>
        </Form>
      </div>
      <div className="pb-6 md:order-1">
        <div className="flex h-full flex-col space-y-4">
          {images.length === 0 && !form.formState.isSubmitting && (
            <InitialDisplay
              focusPrompt={handleFocusPrompt}
              onComplete={(prompt) => form.setValue("prompt", prompt)}
            />
          )}
          <div
            className={`grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}
          >
            {form.formState.isSubmitting &&
              Array.from({ length: skeletons }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={cn(
                    "w-full aspect-square rounded",
                    images.length === 0 &&
                      outputQuantityValue === 1 &&
                      "col-span-2"
                  )}
                  style={{
                    aspectRatio: form.watch("aspectRatio").replace(":", " / "),
                  }}
                />
              ))}
            {images.length > 0 &&
              images.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative",
                    (images.length === 1 || !image.isPreview) && "col-span-2"
                  )}
                  onClick={() => {
                    setSelected(selected === image ? null : image);
                    form.setValue("prompt", image.input.prompt);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  role="button"
                >
                  <div
                    className={cn(
                      "relative rounded overflow-hidden ring-2 ring-offset-2 ring-transparent",
                      selected === image && "ring-primary"
                    )}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={URL.createObjectURL(image.output)}
                      alt={`Generated image ${index + 1}`}
                      draggable="false"
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                  <div
                    className="absolute inset-0 w-full h-full"
                    onContextMenu={(e) => e.preventDefault()}
                  ></div>
                  {!image.isPreview && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="absolute top-2 right-2 inline-flex justify-center items-center bg-black/50 rounded-full">
                          <UpscaleIcon className="text-white h-8 w-8" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          <b>Upscaled</b>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
