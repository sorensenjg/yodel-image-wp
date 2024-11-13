import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { processImage, getImageAspectRatio } from "./utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SoupMenubar } from "./menubar";

import type { Image, MimeType, ImageOperation } from "./types";

interface SoupEditorProps {
  image: Image;
}

export const SoupEditor: React.FC<SoupEditorProps> = ({ image }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [operations, setOperations] = useState<ImageOperation[]>([]);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);
  const [activeProcess, setActiveProcess] = useState<
    "crop" | "rotate" | "flip" | "scale" | null
  >(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [croppedAreaData, setCroppedAreaData] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // Initialize the original image and processed image
  useEffect(() => {
    if (image) {
      const initializeImage = async () => {
        try {
          const base64Image = await processImage(
            image.url,
            image.mime as MimeType
          );
          setOriginalImage(base64Image);
          setProcessedImage(base64Image);
          setOperations([]);

          // set the initial aspect ratio
          getImageAspectRatio(base64Image).then((aspectRatio) => {
            setAspectRatio(aspectRatio);
          });
        } catch (error) {
          console.error("Error initializing image:", error);
        }
      };

      initializeImage();
    }
  }, [image]);

  // Function to apply all operations to the original image
  const applyOperations = async (ops: ImageOperation[]) => {
    if (!originalImage) return;

    setIsProcessing(true);

    try {
      let updatedImage = originalImage;

      for (const op of ops) {
        const operationFunction = getOperationFunction(op);
        updatedImage = await processImage(
          updatedImage,
          image.mime as MimeType,
          operationFunction
        );
      }

      setProcessedImage(updatedImage);
    } catch (error) {
      console.error("Error applying operations:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get the corresponding function for an operation
  const getOperationFunction = (op: ImageOperation) => {
    switch (op.type) {
      case "crop":
        return (instance: any) => {
          instance.crop({
            h: op.payload.h,
            w: op.payload.w,
            x: op.payload.x,
            y: op.payload.y,
          });
        };
      case "rotate":
        return (instance: any) => {
          instance.rotate(op.payload.angle);
        };
      case "flip":
        return (instance: any) => {
          instance.flip(op.payload);
        };
      case "scale":
        return (instance: any) => {
          instance.scale(op.payload.factor);
        };
      default:
        return () => {};
    }
  };

  // Enhanced deduplicate operations with specific handling
  const deduplicateOperations = (ops: ImageOperation[]) => {
    const deduped: ImageOperation[] = [];
    let lastOp: ImageOperation | null = null;

    ops.forEach((op) => {
      if (lastOp && lastOp.type === op.type) {
        switch (op.type) {
          case "rotate":
            // Accumulate rotation angles
            const accumulatedAngle =
              (((lastOp.payload.angle + op.payload.angle) % 360) + 360) % 360;
            deduped[deduped.length - 1] = {
              type: "rotate",
              payload: { angle: accumulatedAngle },
            };
            lastOp = deduped[deduped.length - 1];
            break;

          case "flip":
            // Toggle flip state if the same direction is flipped twice
            const direction = Object.keys(op.payload)[0] as
              | "horizontal"
              | "vertical";
            const isFlipped = lastOp.payload[direction];

            if (isFlipped) {
              // Remove the flip operation as it cancels out
              deduped.pop();
              lastOp = deduped[deduped.length - 1] || null;
            } else {
              deduped[deduped.length - 1] = {
                type: "flip",
                payload: { [direction]: true },
              };
              lastOp = deduped[deduped.length - 1];
            }
            break;

          default:
            // For other operation types, perform the generic deduplication
            if (JSON.stringify(lastOp.payload) === JSON.stringify(op.payload)) {
              // Skip duplicate
            } else {
              deduped.push(op);
              lastOp = op;
            }
            break;
        }
      } else {
        deduped.push(op);
        lastOp = op;
      }
    });

    return deduped;
  };

  const handleCrop = async () => {
    if (!croppedAreaData || !processedImage) return;

    const newOperation: ImageOperation = {
      type: "crop",
      payload: {
        h: croppedAreaData.height,
        w: croppedAreaData.width,
        x: croppedAreaData.x,
        y: croppedAreaData.y,
      },
    };

    const combinedOperations = [...operations, newOperation];
    const dedupedOperations = deduplicateOperations(combinedOperations);

    setOperations(dedupedOperations);
    await applyOperations(dedupedOperations);
  };

  const handleRotate = async () => {
    const newOperation: ImageOperation = {
      type: "rotate",
      payload: { angle: 90 },
    };

    const combinedOperations = [...operations, newOperation];
    const dedupedOperations = deduplicateOperations(combinedOperations);

    setOperations(dedupedOperations);
    await applyOperations(dedupedOperations);
  };

  const handleFlip = async (direction: "horizontal" | "vertical") => {
    const newOperation: ImageOperation = {
      type: "flip",
      payload: { [direction]: true },
    };

    const combinedOperations = [...operations, newOperation];
    const dedupedOperations = deduplicateOperations(combinedOperations);

    setOperations(dedupedOperations);
    await applyOperations(dedupedOperations);
  };

  const handleRevert = () => {
    if (operations.length === 0) return;

    const updatedOperations = operations.slice(0, -1);
    setOperations(updatedOperations);
    applyOperations(updatedOperations);
  };

  const handleSave = async () => {
    if (!processedImage) return;

    await handleCrop();

    // const aspectRatio = await getImageAspectRatio(processedImage ?? "");

    setZoom(1);
    // setAspectRatio(aspectRatio);
    setShowSaveButton(false);
  };

  return (
    <TooltipProvider>
      <div className="text-foreground relative w-full h-full p-8 group dark">
        <div
          ref={editorRef}
          className="relative aspect-[2/1] h-full mx-auto overflow-hidden rounded"
        >
          <Cropper
            image={processedImage ?? ""}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            showGrid={true}
            zoomSpeed={0.3}
            // restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(croppedArea, croppedAreaPixels) => {
              setCroppedAreaData(croppedAreaPixels);

              if (
                croppedAreaPixels.width !== image.width ||
                croppedAreaPixels.height !== image.height
              ) {
                setShowSaveButton(true);
              } else {
                setShowSaveButton(false);
              }
            }}
          />
          <SoupMenubar
            isProcessing={isProcessing}
            activeProcess={activeProcess}
            setActiveProcess={setActiveProcess}
            setAspectRatio={setAspectRatio}
            showSaveButton={showSaveButton}
            handleCrop={handleCrop}
            handleRotate={handleRotate}
            handleFlip={handleFlip}
            handleRevert={handleRevert}
            handleSave={handleSave}
            //   handleReapply={async () => await applyOperations(operations)}
            editorRef={editorRef}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
