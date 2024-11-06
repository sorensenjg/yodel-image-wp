import { useState, useEffect } from "react";
import { getImages } from "@/lib/wordpress";
import { ImageCard } from "@/components/image-card";
import { ImageDetails } from "@/components/image-details";
import type { Image } from "@/types";

export function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  useEffect(() => {
    getImages().then(setImages);
  }, []);

  return (
    <>
      <article className="flex-1 h-full overflow-auto">
        <ul className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 overflow-y-auto my-4 px-4 py-1">
          {images.map((image) => (
            <li key={image.id}>
              <ImageCard
                image={image}
                isSelected={selectedImage?.id === image.id}
                onClick={setSelectedImage}
              />
            </li>
          ))}
        </ul>
      </article>
      <ImageDetails
        image={selectedImage}
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
}
