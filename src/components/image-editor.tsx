import { CropIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateImage } from "@/lib/wordpress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Editor } from "./soup";
import type { Image } from "@/types";

interface ImageEditorModalProps {
  image: Image;
  triggerProps?: React.HTMLAttributes<HTMLButtonElement>;
  modalProps?: React.HTMLAttributes<HTMLDialogElement>;
}

export function ImageEditorModal({
  image,
  triggerProps,
  modalProps,
}: ImageEditorModalProps) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                {...triggerProps}
              >
                <CropIcon aria-hidden="true" className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>
            <p>Open image editor</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent
        className={cn(
          "w-full max-w-full h-full overflow-auto",
          modalProps?.className
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Image Editor</DialogTitle>
        </DialogHeader>
        <Editor
          image={{
            url: image.source_url,
            mime: image.mime_type as any,
            width: image.media_details.width,
            height: image.media_details.height,
            size: image.media_details.filesize,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
