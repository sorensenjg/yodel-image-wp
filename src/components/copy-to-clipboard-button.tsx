import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "lucide-react";
import copy from "copy-to-clipboard";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface CopyToClipboardButtonProps extends ButtonProps {
  value: string;
}

export function CopyToClipboardButton({
  value,
  children,
  ...props
}: CopyToClipboardButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    copy(value);
    setIsCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Button
      type="button"
      {...props}
      onClick={handleCopy}
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
    >
      {isCopied ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <>
          {children}
          <ClipboardIcon className={cn("w-4 h-4", children && "ml-2")} />
        </>
      )}
    </Button>
  );
}
