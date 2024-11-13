import { useState, useRef, useEffect } from "react";
import { useImages } from "@/lib/wordpress";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageCard } from "@/components/image-card";
import { ImageDetails } from "@/components/image-details";
import type { Image } from "@/types";

export function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useImages();

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null, // relative to the viewport
        rootMargin: "1px",
        threshold: 0.1, // trigger when the loader is fully visible
      }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold">Gallery</h2>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">
          {/* Additional buttons or controls can be added here */}
        </div>
      </div>
      <Separator />
      <div className="flex-1 container flex overflow-auto">
        <article className="flex-1">
          <div className="pt-6 pb-24">
            <ul className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto p-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
              {status === "success" &&
                data.pages.map((page, pageIndex) =>
                  page.images.map((image) => (
                    <li key={`${pageIndex}-${image.id}`}>
                      <ImageCard
                        image={image}
                        isSelected={selectedImage?.id === image.id}
                        onClick={setSelectedImage}
                      />
                    </li>
                  ))
                )}
            </ul>
          </div>
          {hasNextPage && (
            <div ref={loaderRef} className="flex justify-center w-full py-12">
              {isFetchingNextPage ? <p>Loading more...</p> : null}
            </div>
          )}
        </article>
        <ImageDetails
          image={selectedImage}
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        />
      </div>
    </div>
  );
}
