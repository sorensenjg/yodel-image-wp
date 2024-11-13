import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { omit } from "lodash";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Loader2, ChevronsUpDown, CircleHelpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices, generateImage } from "@/lib/api";
import { saveImage } from "@/lib/wordpress";
import { generateSeedFromPrompt, generateIterationSeed } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CreditConfirmDialog } from "@/components/credit-confirm-dialog";
import { ImageStyleSelector } from "./components/image-style-selector";
import { AspectRatioSelector } from "./components/aspect-ratio-selector";
import { OutputFormatSelector } from "./components/output-format-selector";
import { OutputQualitySelector } from "./components/output-quality-selector";
import { ModelSelector } from "./components/model-selector";
// import { models, types } from "./data/models";

// @ts-ignore
import placeholderImage from "./data/placeholder.png";

type Model =
  | "black-forest-labs/flux-schnell"
  | "black-forest-labs/flux-pro"
  | "black-forest-labs/flux-1.1-pro"
  | "ideogram-ai/ideogram-v2";

type OutputImage = {
  prompt: string;
  settings: {
    imageStyle?: string;
    model: Model;
    aspectRatio:
      | "1:1"
      | "2:3"
      | "3:2"
      | "3:4"
      | "4:3"
      | "4:5"
      | "5:4"
      | "9:16"
      | "16:9";
    outputFormat: "jpg" | "png" | "webp";
    outputQuality: number;
  };
  seed: number;
  isPreview: boolean;
  output: string;
};

const formSchema = z.object({
  prompt: z.string({
    required_error: "A prompt is required.",
  }),
  imageStyle: z.string().optional(),
  model: z.enum([
    "black-forest-labs/flux-schnell",
    "black-forest-labs/flux-pro",
    "black-forest-labs/flux-1.1-pro",
    "ideogram-ai/ideogram-v2",
  ]),
  aspectRatio: z.enum([
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "4:5",
    "5:4",
    "9:16",
    "16:9",
  ]),
  outputFormat: z.enum(["jpg", "png", "webp"]),
  outputQuality: z.number().min(1).max(100),
  outputQuantity: z.number().min(4).max(8),
});

type FormData = z.infer<typeof formSchema>;

export function GeneratePage() {
  const { data: services } = useServices();
  const [images, setImages] = useState<OutputImage[]>([]);
  const [selected, setSelected] = useState<OutputImage | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "black-forest-labs/flux-1.1-pro",
      prompt: `a logo design for a clothing company called "Poppysicle California", includes a popsicle, 70s handwritten font, muted color palette`,
      imageStyle: undefined,
      aspectRatio: "3:2",
      outputFormat: "jpg",
      outputQuality: 100,
      outputQuantity: 4,
    },
  });

  async function onSubmit(
    values: FormData,
    action: "generate" | "iterate" | "upscale"
  ) {
    const prompt = values.imageStyle
      ? `${values.prompt}, in the style of ${values.imageStyle}`
      : values.prompt;

    try {
      switch (action) {
        case "generate":
          await handleGenerate(values, prompt);
          setSelected(null);
          break;

        case "iterate":
          await handleIterate(values, prompt);
          setSelected(null);
          break;

        case "upscale":
          await handleUpscale(values, prompt);
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

  async function handleGenerate(values: FormData, prompt: string) {
    try {
      const generatePromises = Array.from({
        length: values.outputQuantity,
      }).map(async () => {
        const baseSeed = generateSeedFromPrompt(values.prompt);
        const uniqueSeed = baseSeed + Math.floor(Math.random() * 1000000);
        const output = await generateImage({
          model: values.model,
          prompt,
          aspectRatio: values.aspectRatio,
          outputFormat: values.outputFormat,
          outputQuality: 20,
          seed: uniqueSeed,
        });

        return {
          prompt: `${values.prompt}, in the style of ${values.imageStyle}`,
          settings: omit(values, ["prompt"]),
          seed: uniqueSeed,
          isPreview: true,
          output,
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

  async function handleIterate(values: FormData, prompt: string) {
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
        const iterationPrompt = `${prompt}, iteration: ${iterationHash}`;

        const output = await generateImage({
          model: values.model,
          prompt: iterationPrompt,
          aspectRatio: values.aspectRatio,
          outputFormat: values.outputFormat,
          outputQuality: 20,
          seed: selected.seed,
        });

        return {
          prompt: `${values.prompt}, in the style of ${values.imageStyle}`,
          settings: omit(values, ["prompt"]),
          seed: selected.seed,
          isPreview: true,
          output,
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

  async function handleUpscale(values: FormData, prompt: string) {
    if (!selected) {
      toast.error("No selected image available to upscale");
      return;
    }

    try {
      const output = await generateImage({
        model: values.model,
        prompt,
        aspectRatio: selected.settings.aspectRatio,
        outputFormat: selected.settings.outputFormat,
        outputQuality: selected.settings.outputQuality,
        seed: selected.seed,
      });

      const upscaledImage = {
        prompt: `${selected.prompt}, in the style of ${selected.settings.imageStyle}`,
        settings: omit(selected.settings, ["prompt"]),
        seed: selected.seed,
        isPreview: false,
        output,
      } as OutputImage;

      setImages([upscaledImage]);
      await handleSave(upscaledImage);
      toast.success("Image upscaled and saved successfully");
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

      const prompt = image.settings.imageStyle
        ? `${image.prompt}, in the style of ${image.settings.imageStyle}`
        : image.prompt;
      const blob = await response.blob();
      const filename = `${nanoid()}.${image.settings.outputFormat}`;
      const file = new File([blob], filename, { type: blob.type });

      const saveResponse = await saveImage(file, {
        yodel_image_prompt: prompt,
        yodel_image_settings: JSON.stringify(omit(image.settings, ["prompt"])),
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
  const selectedModel = services?.find(
    (service: any) => service.id === form.getValues("model")
  );
  console.log(selectedModel);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold">Generate</h2>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end"></div>
      </div>
      <Separator />
      <div className="flex-1 overflow-auto">
        <div className="container h-full py-6">
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
                              Prompt <CircleHelpIcon className="h-4 w-4" />
                            </FormLabel>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="prose w-[320px] text-sm"
                            side="left"
                          >
                            <p>
                              The <b>Prompt</b> is used to describe the image
                              you want to create. It should be as detailed as
                              possible to help instruct the generation process.
                            </p>
                            <p>
                              For models that support text generation, any words
                              you want to appear in the image itself, should be
                              entered in "double quotes."
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
                  {(!selected || !isSelectedProduction) && (
                    <ImageStyleSelector />
                  )}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        className="w-full justify-start px-0"
                        variant="link"
                      >
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {images.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="link">
                            Reset
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your current image(s) and reset
                              your prompt and settings.
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
                    {(images.length === 0 ||
                      images.every((image) => image.isPreview)) && (
                      <CreditConfirmDialog
                        // tooltip="Services include..."
                        title={
                          selected && !isSelectedProduction
                            ? "Iterate Selection"
                            : "Generate Previews"
                        }
                        description={
                          selected && !isSelectedProduction
                            ? "This will generate iterations of your selected preview image."
                            : "This will generate image preview(s) based on your prompt and settings."
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
                          disabled={form.formState.isSubmitting}
                        >
                          {selected && !isSelectedProduction
                            ? "Iterate"
                            : "Generate"}
                        </Button>
                      </CreditConfirmDialog>
                    )}
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
                          disabled={form.formState.isSubmitting}
                        >
                          Upscale
                        </Button>
                      </CreditConfirmDialog>
                    )}
                  </div>
                </form>
              </Form>
            </div>
            <div className="md:order-1">
              <div className="flex h-full flex-col space-y-4">
                <div className={`grid grid-cols-2 gap-4`}>
                  {!form.formState.isSubmitting && images.length > 0 ? (
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
                      </div>
                    ))
                  ) : (
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="w-full aspect-square rounded"
                          style={{
                            aspectRatio: form
                              .watch("aspectRatio")
                              .replace(":", " / "),
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
