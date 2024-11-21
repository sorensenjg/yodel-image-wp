import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  Loader2 as LoadingIcon,
  ChevronsUpDown,
  CircleHelpIcon as HelpIcon,
  CircleFadingArrowUp as UpscaleIcon,
} from "lucide-react";
import { cn, sleep } from "@/lib/utils";
import { useCredits, useServices, generateImage } from "@/lib/api";
import { saveImage } from "@/lib/wordpress";
import { generateSeedFromPrompt, generateIterationSeed } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditConfirmDialog } from "@/components/credit-confirm-dialog";
import { CreditMenu } from "@/components/credit-menu";
import { ImageStyleSelector } from "./components/image-style-selector";
import { AspectRatioSelector } from "./components/aspect-ratio-selector";
import { OutputFormatSelector } from "./components/output-format-selector";
import { OutputQualitySelector } from "./components/output-quality-selector";
import { ModelSelector } from "./components/model-selector";
// import { models, types } from "./data/models";

// @ts-ignore
import placeholderImage from "./data/placeholder.jpeg";

type Model =
  | "black-forest-labs/flux-schnell"
  | "black-forest-labs/flux-1.1-pro"
  | "ideogram-ai/ideogram-v2"
  | "recraft-ai/recraft-v3-svg";

type OutputImage = {
  output: string;
  input: {
    model: Model;
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

const formSchema = z.object({
  prompt: z.string({
    required_error: "A prompt is required.",
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
  outputQuantity: z.number().min(4).max(8),
});

type FormData = z.infer<typeof formSchema>;

// function GenerateImageForm() {
//   return (

//   )
// }

export function GenerateImage() {
  const { data: credits, status } = useCredits();
  const { data: services } = useServices();
  const [images, setImages] = useState<OutputImage[]>([]);
  const [selected, setSelected] = useState<OutputImage | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "black-forest-labs/flux-1.1-pro",
      prompt: `logo design for a company called "Yodel", the logomark should be a mountain, inspired by the ancient yodels of the central alps, software, ai, microservices`,
      style: undefined,
      aspectRatio: "1:1",
      outputFormat: "jpg",
      outputQuality: 100,
      outputQuantity: 4,
    },
  });

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
          await handleUpscale(selected);
          setSelected(null);
          break;

        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error("Error processing image(s):", error);
      toast.error("Failed to process image(s).");
    }
  }

  async function handleGenerate(values: FormData) {
    try {
      const generatePromises = Array.from({
        length: values.outputQuantity,
      }).map(async () => {
        const baseSeed = generateSeedFromPrompt(values.prompt);
        const uniqueSeed = baseSeed + Math.floor(Math.random() * 1000000);
        const output = await generateImage({
          model: values.model,
          prompt: values.prompt,
          style: values.style,
          aspectRatio: values.aspectRatio,
          outputFormat: values.outputFormat,
          outputQuality: 20,
          seed: uniqueSeed,
        });

        return {
          output,
          input: values,
          seed: uniqueSeed,
          isPreview: true,
        };
      });

      const outputs = (await Promise.all(generatePromises)) as OutputImage[];

      setImages((prev) => [...outputs, ...prev]);
      toast.success("Previews generated successfully");
    } catch (error) {
      console.error("Error generating previews:", error);
      toast.error("Failed to generate previews");
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
      const generatePromises = Array.from({
        length: values.outputQuantity,
      }).map(async (_, index) => {
        const iterationHash = generateIterationSeed(
          selected.seed,
          index + 1,
          0.2
        );
        const iterationPrompt = `${values.prompt}, iteration: ${iterationHash}`;

        const output = await generateImage({
          model: selected.input.model,
          prompt: iterationPrompt,
          style: values.style,
          aspectRatio: values.aspectRatio,
          outputFormat: values.outputFormat,
          outputQuality: 20,
          seed: selected.seed,
        });

        return {
          output,
          input: {
            ...values,
            model: selected.input.model,
            prompt: iterationPrompt,
          },
          seed: selected.seed,
          isPreview: true,
        };
      });

      const outputs = (await Promise.all(generatePromises)) as OutputImage[];

      setImages((prev) => [...outputs, ...prev]);
      toast.success("Iterations generated successfully");
    } catch (error) {
      console.error("Error generating iterations:", error);
      toast.error("Failed to generate iterations");
    }
  }

  async function handleUpscale(selected: OutputImage | null | undefined) {
    if (!selected) {
      toast.error("No selected image available to upscale");
      return;
    }

    if (selected.input.model === "ideogram-ai/ideogram-v2") {
      await sleep(5000);

      setImages([selected]);
      toast.success("Image upscaled successfully");
      await handleSave(selected);
      return;
    }

    try {
      const output = await generateImage({
        model: selected.input.model,
        prompt: selected.input.prompt,
        style: selected.input.style,
        aspectRatio: selected.input.aspectRatio,
        outputFormat: selected.input.outputFormat,
        outputQuality: selected.input.outputQuality,
        seed: selected.seed,
      });

      const upscaledImage = {
        output,
        input: selected.input,
        seed: selected.seed,
        isPreview: false,
      } as OutputImage;

      setImages([upscaledImage]);
      toast.success("Image upscaled successfully");
      await handleSave(upscaledImage);
    } catch (error) {
      console.error("Error upscaling image:", error);
      toast.error("Failed to upscale image.");
    }
  }

  const handleSave = async (image: OutputImage) => {
    if (!image || image.isPreview) {
      toast.error("No upscaled image available to save");
      return;
    }

    try {
      const response = await fetch(image.output);

      if (!response.ok) {
        throw new Error("Failed to fetch the image");
      }

      const blob = await response.blob();
      const filename = `${nanoid()}.${image.input.outputFormat}`;
      const file = new File([blob], filename, { type: blob.type });

      const saveResponse = await saveImage(file, {
        yodel_image_input: JSON.stringify(image.input),
        yodel_image_seed: image.seed,
      });

      if (!saveResponse.id) {
        throw new Error("Invalid response saving image");
      }

      // const uploadUrl = new URL("/wp-admin/upload.php", window.location.origin);
      // uploadUrl.searchParams.append("item", saveResponse.id.toString());
      // : <a href="${uploadUrl.toString()}" target="_blank" rel="noopener noreferrer">View</a>

      toast.success(`Image saved successfully`);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Uh oh! Something went wrong while saving the image");
    }
  };

  const handleReset = () => {
    form.reset();
    setImages([]);
    setSelected(null);
  };

  const isSelectedProduction = selected && !selected.isPreview;

  const selectedModelId = form.watch("model");
  const selectedModel = services?.find(
    (service: any) => service.id === selectedModelId
  );

  if (status === "pending") {
    return null;
  }

  const hasInsufficientCredits = credits < selectedModel.cost;

  return (
    <div className="py-6">
      <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_300px]">
        <div className="flex flex-col space-y-4 md:order-2">
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
                          The <b>Prompt</b> is used to describe the image you
                          want to create. It should be as detailed as possible
                          to help instruct the generation process.
                        </p>
                        <p>
                          For models that support text generation, any words you
                          want to appear in the image itself, should be entered
                          in "double quotes."
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                    <FormControl>
                      <Textarea
                        className="h-32"
                        placeholder='black forest gateau cake spelling out the words "Yodel Image", tasty, food photography'
                        disabled={!!isSelectedProduction}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(!selected || !isSelectedProduction) && <ImageStyleSelector />}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button className="w-full justify-start px-0" variant="link">
                    Advanced Settings
                    <ChevronsUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
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
                  {(!selected || !isSelectedProduction) && (
                    <AspectRatioSelector />
                  )}
                  {(!selected || !isSelectedProduction) && (
                    <OutputFormatSelector />
                  )}
                  {(!selected || !isSelectedProduction) && (
                    <OutputQualitySelector />
                  )}
                  {/* {(!selected || !isSelectedProduction) && (
                        <FormField
                          control={form.control}
                          name="outputQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preview Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(event) =>
                                    field.onChange(Number(event.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )} */}
                </CollapsibleContent>
              </Collapsible>
              <div className="flex justify-end items-center space-x-2 mt-12">
                {form.formState.isSubmitting && (
                  <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {images.length > 0 && (
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
                          This action cannot be undone. This will permanently
                          delete your current image(s) and reset your prompt and
                          input.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel type="button">
                          Cancel
                        </AlertDialogCancel>
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
                )}
                {/* {images.length === 1 && !images[0].isPreview && (
                      <Button
                        type="button"
                        onClick={() => handleSave(images[0])}
                      >
                        Save Image
                      </Button>
                      )} */}

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

                {
                  // (images.length === 0 || images.every((image) => image.isPreview))
                  ((selected && !isSelectedProduction) ||
                    images.length > 0 ||
                    images.length === 0) && (
                    <CreditConfirmDialog
                      tooltip="Purchase credits to continue"
                      title={
                        selected && !isSelectedProduction
                          ? "Iterate Selection"
                          : "Generate Previews"
                      }
                      description={
                        selected && !isSelectedProduction
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
                            selected && !isSelectedProduction
                              ? "iterate"
                              : "generate"
                          );
                        })();
                      }}
                    >
                      <Button
                        type="button"
                        disabled={
                          form.formState.isSubmitting || hasInsufficientCredits
                        }
                      >
                        {selected && !isSelectedProduction
                          ? "Iterate"
                          : "Generate"}
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
                        name: selectedModel?.name,
                        cost: selectedModel?.cost,
                        quantity: 1,
                      },
                    ]}
                    onConfirm={() => {
                      form.handleSubmit(
                        async (values) => await onSubmit(values, "upscale")
                      )();
                    }}
                  >
                    <Button
                      type="button"
                      disabled={
                        form.formState.isSubmitting || hasInsufficientCredits
                      }
                    >
                      Upscale
                    </Button>
                  </CreditConfirmDialog>
                )}
              </div>
              {hasInsufficientCredits && (
                <FormMessage className="text-center !mt-12">
                  You do not have enough
                  <br /> credits to continue
                </FormMessage>
              )}
            </form>
          </Form>
        </div>
        <div className="md:order-1">
          <div className="flex h-full flex-col space-y-4">
            <div className={`grid grid-cols-2 gap-4`}>
              {/* {Array.from({ length: 20 }).map((_, index) => (
                      <div
                        key={index}
                        className="relative"
                        onContextMenu={(e) => e.preventDefault()}
                        role="button"
                      >
                        <div className="relative rounded overflow-hidden ring-2 ring-offset-2 ring-transparent">
                          <img
                            src={placeholderImage}
                            alt="Placeholder image"
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </div>
                        <div
                          className="absolute inset-0 w-full h-full"
                          onContextMenu={(e) => e.preventDefault()}
                        ></div>
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
                      </div>
                    ))} */}

              {(images.length === 0 || form.formState.isSubmitting) &&
                Array.from({ length: form.watch("outputQuantity") }).map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      className="w-full aspect-square rounded"
                      style={{
                        aspectRatio: form
                          .watch("aspectRatio")
                          .replace(":", " / "),
                      }}
                    />
                  )
                )}
              {images.length > 0 &&
                images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative",
                      images.length === 1 && "col-span-2"
                    )}
                    onClick={() =>
                      setSelected(selected === image ? null : image)
                    }
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
                        src={image.output}
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
    </div>
  );
}
