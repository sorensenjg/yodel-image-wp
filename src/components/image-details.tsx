import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatBytes, stripHtml } from "@/lib/utils";
import { updateImage } from "@/lib/wordpress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  type SheetProps,
} from "@/components/ui/sheet";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard-button";
import { GenerateMetadata } from "@/components/generate-metadata";
import { ImageEditor } from "@/components/image-editor";
import { SERVICES } from "@/config";
import type { Image } from "@/types";

export const ImageDetailsFormSchema = z.object({
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type ImageDetailsFormData = z.infer<typeof ImageDetailsFormSchema>;

type ImageDetailsIsEditing = {
  alt_text: boolean;
  caption: boolean;
  title: boolean;
  description: boolean;
};

export interface ImageDetailsProps extends SheetProps {
  image: Image | null;
}

export function ImageDetails({ image, ...props }: ImageDetailsProps) {
  const [isEditing, setIsEditing] = useState<ImageDetailsIsEditing>({
    alt_text: false,
    caption: false,
    title: false,
    description: false,
  });

  const form = useForm<ImageDetailsFormData>({
    resolver: zodResolver(ImageDetailsFormSchema),
    defaultValues: {
      alt_text: image?.alt_text || "",
      caption: stripHtml(image?.caption?.rendered) || "",
      title: image?.title.rendered || "",
      description: stripHtml(image?.description?.rendered) || "",
    },
  });

  useEffect(() => {
    // set default values
    form.reset({
      alt_text: image?.alt_text || "",
      caption: stripHtml(image?.caption?.rendered) || "",
      title: image?.title.rendered || "",
      description: stripHtml(image?.description?.rendered) || "",
    });

    resetEditing();
  }, [image]);

  const resetEditing = () => {
    setIsEditing({
      alt_text: false,
      caption: false,
      title: false,
      description: false,
    });
  };

  const onSubmit = async (values: ImageDetailsFormData) => {
    await updateImage(image!.id, values);
    resetEditing();
  };

  const altTextValue = form.watch("alt_text");
  const captionValue = form.watch("caption");
  const titleValue = form.watch("title");
  const descriptionValue = form.watch("description");

  return (
    <Sheet modal={false} {...props}>
      {image && (
        <SheetContent
          className="absolute !w-full !max-w-[500px] h-full overflow-auto"
          side="right"
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">{titleValue}</SheetTitle>
                <div className="space-y-6 pb-16">
                  <div className="flex flex-col gap-x-8 gap-y-4 mt-4 mb-8">
                    <div className="relative aspect-square w-full overflow-hidden rounded border bg-transparent-image md:max-w-[400px]">
                      <img
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        src={image.source_url}
                        alt={image.alt_text}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">
                          <span className="sr-only">Details for </span>
                          {titleValue}
                        </h2>
                        {/* <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          className="hover:!bg-transparent"
                        >
                          <HeartIcon
                            aria-hidden="true"
                            className={cn(
                              "w-4 h-4 hover:fill-red-500 hover:stroke-red-500",
                              image.featured_media &&
                                "fill-red-500 stroke-red-500"
                            )}
                          />
                          <span className="sr-only">Favorite</span>
                        </Button> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <ImageEditor image={image} />
                        <GenerateMetadata
                          image={image}
                          services={Object.values(SERVICES)}
                          buttonProps={{
                            title: "Generate Metadata",
                            variant: "secondary",
                          }}
                          onComplete={(value) => {
                            form.setValue("alt_text", value.alt_text);
                            form.setValue("caption", value.caption);
                            form.setValue("title", value.title);
                            form.setValue("description", value.description);
                            form.handleSubmit(onSubmit)();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Alternative Text</h3>
                    <div className="flex justify-between items-center gap-2">
                      <FormField
                        control={form.control}
                        name="alt_text"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormLabel className="sr-only">
                              Alternative Text
                            </FormLabel>
                            {isEditing.alt_text ? (
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Add alternative text to this image"
                                  onBlur={() => {
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      alt_text: false,
                                    }));
                                    form.handleSubmit(onSubmit)();
                                  }}
                                  autoFocus={isEditing.alt_text}
                                />
                              </FormControl>
                            ) : (
                              <p
                                className="text-muted-foreground text-sm cursor-pointer"
                                onClick={() =>
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    alt_text: true,
                                  }))
                                }
                              >
                                {altTextValue || (
                                  <span className="italic">
                                    Add alternative text to this image
                                  </span>
                                )}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <GenerateMetadata
                        image={image}
                        services={[SERVICES.alt_text]}
                        buttonProps={{
                          variant: "ghost",
                        }}
                        onComplete={(value) => {
                          form.setValue("alt_text", value.alt_text);
                          setIsEditing((prev) => ({
                            ...prev,
                            alt_text: true,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Caption</h3>
                    <div className="flex justify-between items-center gap-2">
                      <FormField
                        control={form.control}
                        name="caption"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormLabel className="sr-only">Caption</FormLabel>
                            {isEditing.caption ? (
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Add a caption to this image"
                                  onBlur={() => {
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      caption: false,
                                    }));
                                    form.handleSubmit(onSubmit)();
                                  }}
                                  autoFocus={isEditing.caption}
                                />
                              </FormControl>
                            ) : (
                              <p
                                className="text-muted-foreground text-sm cursor-pointer"
                                onClick={() =>
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    caption: true,
                                  }))
                                }
                              >
                                {captionValue || (
                                  <span className="italic">
                                    Add a caption to this image
                                  </span>
                                )}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <GenerateMetadata
                        image={image}
                        services={[SERVICES.caption]}
                        buttonProps={{
                          variant: "ghost",
                        }}
                        onComplete={(value) => {
                          form.setValue("caption", value.caption);
                          setIsEditing((prev) => ({
                            ...prev,
                            caption: true,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <div className="flex justify-between items-center gap-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormLabel className="sr-only">
                              Description
                            </FormLabel>
                            {isEditing.description ? (
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Add a description to this image"
                                  onBlur={() => {
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      description: false,
                                    }));
                                    form.handleSubmit(onSubmit)();
                                  }}
                                  autoFocus={isEditing.description}
                                />
                              </FormControl>
                            ) : (
                              <p
                                className="text-muted-foreground text-sm cursor-pointer"
                                onClick={() =>
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    description: true,
                                  }))
                                }
                              >
                                {descriptionValue || (
                                  <span className="italic">
                                    Add a description to this image
                                  </span>
                                )}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <GenerateMetadata
                        image={image}
                        services={[SERVICES.description]}
                        buttonProps={{
                          variant: "ghost",
                        }}
                        onComplete={(value) => {
                          form.setValue(
                            "description",
                            stripHtml(value.description)
                          );
                          setIsEditing((prev) => ({
                            ...prev,
                            description: true,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Information</h3>
                    <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Uploaded by</dt>
                        <dd className="whitespace-nowrap text-gray-900">
                          {image._embedded.author[0].name}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Created at</dt>
                        <dd className="whitespace-nowrap text-gray-900">
                          {format(
                            new Date(image.date),
                            "MMMM d, yyyy, hh:mm a"
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Updated at</dt>
                        <dd className="whitespace-nowrap text-gray-900">
                          {format(
                            new Date(image.modified),
                            "MMMM d, yyyy, hh:mm a"
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Dimensions</dt>
                        <dd className="whitespace-nowrap text-gray-900">
                          {image.media_details.width} x{" "}
                          {image.media_details.height} px
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">File type</dt>
                        <dd className="whitespace-nowrap text-gray-900">
                          {image.mime_type}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">File size</dt>
                        <dd className="whitespace-nowrap text-gray-900">
                          {formatBytes(image.media_details.filesize)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  {/* <div>
                  <h3 className="font-medium text-gray-900">Shared with</h3>
                  <ul
                    role="list"
                    className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200"
                  >
                    {currentFile.sharedWith.map((person) => (
                      <li
                        key={person.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center">
                          <img
                            alt=""
                            src={person.imageUrl}
                            className="h-8 w-8 rounded-full"
                          />
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            {person.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="ml-6 rounded-md bg-white text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          Remove<span className="sr-only"> {person.name}</span>
                        </button>
                      </li>
                    ))}
                    <li className="flex items-center justify-between py-2">
                      <button
                        type="button"
                        className="group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                          <PlusIcon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="ml-4 text-sm font-medium text-primary-600 group-hover:text-primary-500">
                          Share
                        </span>
                      </button>
                    </li>
                  </ul>
                </div> */}
                  <div className="flex flex-col gap-y-2 gap-x-3 sm:flex-row">
                    <Button type="button" className="flex-1" asChild>
                      <a href={image.source_url} download>
                        Download
                      </a>
                    </Button>
                    <CopyToClipboardButton
                      className="flex-1"
                      value={image.source_url}
                    >
                      Share
                    </CopyToClipboardButton>
                  </div>
                </div>
              </SheetHeader>
            </form>
          </Form>
        </SheetContent>
      )}
    </Sheet>
  );
}
