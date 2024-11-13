import { cn } from "@/lib/utils";
import type { Image } from "@/types";

export interface ImageCardProps {
  image: Image;
  isSelected: boolean;
  onClick?: (image: Image) => void;
}

export function ImageCard({ image, isSelected, onClick }: ImageCardProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-[1/1] shrink-0 border rounded overflow-hidden bg-muted",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <img
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={image.source_url}
        alt={image.title.rendered}
      />
      <button
        type="button"
        className="absolute inset-0 focus:outline-none"
        onClick={() => onClick?.(image)}
      >
        <span className="sr-only">View details for {image.title.rendered}</span>
      </button>
    </div>
  );
}
