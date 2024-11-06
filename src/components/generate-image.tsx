import { useState } from "react";
import { SparklesIcon, Loader2Icon } from "lucide-react";
// import { cn, convertImageUrlToDataUrl } from "@/lib/utils";
// import { generateMetadata } from "@/lib/api";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GenerateImageProps {
  buttonProps?: ButtonProps;
}

export function GenerateImage({ buttonProps }: GenerateImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateImage = async () => {
    setIsLoading(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="xs" {...buttonProps}>
          Generate Image
          <SparklesIcon className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-full h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Generate Image</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            {/* <p className="font-bold">
              <span>Cost:</span>{" "}
              {services.reduce((acc, service) => acc + service.cost, 0)} Credits
            </p> */}
            {/* <Button type="button" onClick={handleGenerateImage}>
              {isLoading ? (
                <>
                  Generating{" "}
                  <Loader2Icon className="w-4 h-4 ml-2 animate-spin" />
                </>
              ) : (
                "Confirm"
              )}
            </Button> */}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
