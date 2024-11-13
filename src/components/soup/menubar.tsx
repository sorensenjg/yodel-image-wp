import React from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Undo2Icon,
  CropIcon,
  RotateCcwSquareIcon,
  ExpandIcon,
  FlipHorizontalIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

interface SoupMenubarProps {
  isProcessing: boolean;
  activeProcess: "crop" | "rotate" | "flip" | "scale" | null;
  setActiveProcess: React.Dispatch<
    React.SetStateAction<"crop" | "rotate" | "flip" | "scale" | null>
  >;
  setAspectRatio: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleCrop: () => void;
  handleRotate: () => void;
  handleFlip: (direction: "horizontal" | "vertical") => void;
  handleRevert: () => void;
  handleSave: () => void;
  showSaveButton: boolean;
  editorRef: RefObject<HTMLDivElement>;
}

export const SoupMenubar: React.FC<SoupMenubarProps> = ({
  isProcessing,
  activeProcess,
  setActiveProcess,
  setAspectRatio,
  handleCrop,
  handleRotate,
  handleFlip,
  handleRevert,
  handleSave,
  showSaveButton,
  editorRef,
}) => {
  return (
    <Menubar className="absolute bottom-5 left-1/2 -translate-x-1/2 h-auto opacity-0 transition-opacity duration-500 group-hover:opacity-100">
      <MenubarMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MenubarTrigger
                className={cn(
                  "cursor-pointer hover:bg-accent",
                  activeProcess === "crop" && "bg-accent"
                )}
                onClick={() =>
                  setActiveProcess((prev) => (prev === "crop" ? null : "crop"))
                }
                disabled={isProcessing}
              >
                <CropIcon className="w-6 h-6" />
              </MenubarTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Crop</p>
            </TooltipContent>
          </Tooltip>
          <MenubarContent side="top" align="center">
            <MenubarSub>
              <MenubarSubTrigger>Aspect Ratio</MenubarSubTrigger>
              <MenubarSubContent
                collisionBoundary={editorRef.current}
                collisionPadding={20}
              >
                {[
                  { ratio: 1 / 1, label: "1:1" },
                  { ratio: 2 / 1, label: "2:1" },
                  { ratio: 3 / 2, label: "3:2" },
                  { ratio: 4 / 3, label: "4:3" },
                  { ratio: 5 / 4, label: "5:4" },
                  { ratio: 16 / 9, label: "16:9" },
                ].map(({ ratio, label }) => (
                  <MenubarItem
                    key={label}
                    onClick={() => setAspectRatio(ratio)}
                  >
                    {label}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem>
              Aspect Ratio
              <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </TooltipProvider>
      </MenubarMenu>

      <MenubarMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MenubarTrigger
                className="cursor-pointer hover:bg-accent"
                onClick={handleRotate}
                disabled={isProcessing}
              >
                <RotateCcwSquareIcon className="w-6 h-6" />
              </MenubarTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rotate left</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </MenubarMenu>

      <MenubarMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MenubarTrigger
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleFlip("horizontal")}
                disabled={isProcessing}
              >
                <FlipHorizontalIcon className="w-6 h-6" />
              </MenubarTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip horizontally</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </MenubarMenu>

      <MenubarMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MenubarTrigger className="cursor-pointer hover:bg-accent">
                <ExpandIcon className="w-5 h-5" />
              </MenubarTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scale</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </MenubarMenu>

      <MenubarMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MenubarTrigger
                className="cursor-pointer hover:bg-accent"
                onClick={handleRevert}
                disabled={isProcessing}
              >
                <Undo2Icon className="w-5 h-5" />
              </MenubarTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Revert change</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </MenubarMenu>

      {showSaveButton && (
        <MenubarMenu>
          <MenubarTrigger
            className="cursor-pointer hover:bg-accent"
            onClick={() => {
              handleSave();
            }}
            disabled={isProcessing}
          >
            Save Changes
          </MenubarTrigger>
        </MenubarMenu>
      )}
    </Menubar>
  );
};
