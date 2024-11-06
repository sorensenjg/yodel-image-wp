import { CropIcon } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Image } from "@/types";

export function ImageEditor({ image }: { image: Image }) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button type="button" size="icon-xs" variant="secondary">
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
      <DialogContent className="w-full max-w-full h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Generate Metadata?</DialogTitle>
          <DialogDescription>
            This will generate the following image metadata: title, description,
            caption, and alternative text.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <div>
              <span className="font-bold">Cost:</span> 4 Credits
            </div>
            <Button
              type="button"
              // onClick={handleGenerateMetadata}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
