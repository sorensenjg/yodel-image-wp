import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Image } from "@/types";

const { config } = window.yodelImageAdmin;

export function useImages() {
  const result = useInfiniteQuery<{
    images: Image[];
    pagination: {
      currentPage: number;
      totalPages: number;
    };
  }>({
    queryKey: ["images"],
    queryFn: async (context) => getImages(context.pageParam as number),
    getNextPageParam: (lastPage: {
      pagination: { currentPage: number; totalPages: number };
    }) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  return result;
}

// https://developer.wordpress.org/rest-api/reference/media/
export async function getImages(page: number = 1) {
  const url = config.restUrl + "/media";

  try {
    const response = await axios.get(url, {
      params: {
        media_type: "image",
        _embed: "author",
        per_page: 20,
        page,
      },
    });

    const totalPages = parseInt(response.headers["x-wp-totalpages"], 10);

    return {
      images: response.data,
      pagination: {
        currentPage: page,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Unexpected error getting images:", error);
    throw new Error("An unexpected error occurred while getting the images.");
  }
}

export async function saveImage(
  file: any,
  meta?: {
    yodel_image_prompt: string;
    yodel_image_settings: string;
    yodel_image_seed: number;
  }
) {
  const url = config.restUrl + "/media";

  const formData = new FormData();
  formData.append("file", file);

  if (meta) {
    Object.keys(meta).forEach((key) => {
      formData.append(`meta[${key}]`, String(meta[key as keyof typeof meta]));
    });
  }

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-WP-Nonce": config.restNonce,
      },
    });

    if (response.status !== 201) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Unexpected error saving image:", error);
    throw new Error("An unexpected error occurred while saving the image.");
  }
}

export async function updateImage(id: number, data: any) {
  const url = config.restUrl + `/media/${id}`;

  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-WP-Nonce": config.restNonce,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Unexpected error updating image:", error);
    throw new Error("An unexpected error occurred while updating the image.");
  }
}

export async function updateOptions(data: { [key: string]: string | Blob }) {
  const { ajaxUrl, ajaxNonce } = config;

  const formData = new FormData();
  formData.append("action", "yodel_image_update_options");
  formData.append("nonce", ajaxNonce);

  Object.keys(data).forEach((key) => formData.append(key, data[key]));

  try {
    const response = await axios.post(ajaxUrl, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating options:", error);
    throw error;
  }
}
