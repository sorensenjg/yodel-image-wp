import { cn, formatBytes } from "@/lib/utils";
import type { Image } from "@/types";

export interface ImageCardProps {
  image: Image;
  isSelected: boolean;
  onClick?: (image: Image) => void;
}

export function ImageCard({ image, isSelected, onClick }: ImageCardProps) {
  return (
    <div>
      <div
        className={cn(
          "relative w-full aspect-square shrink-0 border rounded overflow-hidden bg-muted",
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
          <span className="sr-only">
            View details for {image.title.rendered}
          </span>
        </button>
      </div>
      <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
        {image.title.rendered}
      </p>
      {/* <p className="pointer-events-none block text-sm font-medium text-gray-500">
        {image.mime_type} {formatBytes(image.media_details.filesize)}
      </p> */}
    </div>
  );
}
