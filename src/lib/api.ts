import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
// import { getStripe } from "@/lib/stripe";

const { config, settings } = window.yodelImageAdmin;

export function useCredits() {
  const result = useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const response = await axios.get(`${config.apiUrl}/api/v1/account`, {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
      });
      return response.data;
    },
  });

  return {
    ...result,
    data: result.data?.credits ?? 0,
  };
}

export function useServices() {
  const result = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await axios.get(`${config.apiUrl}/api/v1/services`, {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
      });
      return response.data;
    },
  });

  return result;
}

const SVG_MODELS = ["recraft-ai/recraft-v3-svg"];
export async function generateImage({
  model,
  prompt,
  style,
  aspectRatio,
  outputFormat,
  outputQuality,
  seed,
}: {
  model: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  outputFormat?: string;
  outputQuality?: number;
  seed?: number | null;
}) {
  try {
    const response = await axios.post(
      `${config.apiUrl}/api/v1/generate/image`,
      {
        model,
        prompt,
        style,
        aspectRatio,
        outputFormat,
        outputQuality,
        seed,
      },
      {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
        ...(!SVG_MODELS.includes(model) && {
          responseType: "blob",
        }),
      }
    );

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    let blob = response.data;

    if (SVG_MODELS.includes(model)) {
      blob = new Blob([response.data], {
        type: "image/svg+xml;charset=UTF-8",
      });
    }

    return blob;
  } catch (error: any) {
    console.error("Unexpected error during image generation:", error);

    if (
      error.response &&
      error.response.data instanceof Blob &&
      error.response.data.type === "application/json"
    ) {
      try {
        const errorText = await error.response.data.text();
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || "Unknown error occurred.");
      } catch (parseError) {
        console.error("Error parsing blob error response:", parseError);
        throw new Error("Failed to parse error response.");
      }
    } else {
      throw new Error(
        error.response?.data?.message || error.message || "An error occurred."
      );
    }
  }
}

export function useGenerateImage() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["credits"] });
    },
  });

  return mutation;
}

export async function upscaleImage({
  image,
  prompt,
}: {
  image: string;
  prompt: string;
}) {
  try {
    const response = await axios.post(
      `${config.apiUrl}/api/v1/generate/image`,
      {
        model: "batouresearch/magic-image-refiner",
        image,
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
        responseType: "blob",
      }
    );

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error: any) {
    console.error("Unexpected error during image upscaling:", error);

    try {
      const errorText = await error.response.data.text();
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || "Unknown error occurred.");
    } catch (parseError) {
      console.error("Error parsing blob error response:", parseError);
      throw new Error("Failed to parse error response.");
    }
  }
}

export function useUpscaleImage() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: upscaleImage,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["credits"] });
    },
  });

  return mutation;
}

export async function generateMetadata({
  model,
  image,
  quantity,
}: {
  model: string;
  image: string;
  quantity: number;
}) {
  try {
    const response = await axios.post(
      `${config.apiUrl}/api/v1/generate/metadata`,
      { model, image, quantity },
      {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error generating image metadata:", error);
    throw error;
  }
}

export function useGenerateMetadata() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: generateMetadata,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["credits"] });
    },
  });

  return mutation;
}

export function useGeneratePrompt() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: generatePrompt,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["credits"] });
    },
  });

  return mutation;
}

export async function generatePrompt({ image }: { image: string }) {
  try {
    const response = await axios.post(
      `${config.apiUrl}/api/v1/generate/prompt`,
      { image },
      {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error generating image prompt:", error);
    throw error;
  }
}

export async function validateApiKey(apiKey: string) {
  try {
    const response = await axios.post(
      `${config.apiUrl}/api/v1/validate-api-key`,
      {
        api_key: apiKey,
      }
    );

    return response.data.success;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "API key validation failed:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error during API key validation:", error);
    }
    return false;
  }
}

// export async function createCheckoutSession(
//   quantity: number,
//   customerId: string | null,
//   callbackUrl: string
// ) {
//   const response = await axios.post(
//     `${config.apiUrl}/api/v1/create-checkout-session`,
//     {
//       quantity,
//       customer_id: customerId,
//       callback_url: callbackUrl,
//     }
//   );

//   return response.data;
// }

// export async function purchaseCredits(
//   quantity: number,
//   customerId: string,
//   callbackUrl: string
// ) {
//   const { id: sessionId, signupUrl } = await createCheckoutSession(
//     quantity,
//     customerId,
//     callbackUrl
//   );

//   if (signupUrl) {
//     window.location.href = signupUrl;
//   } else {
//     const stripe = await getStripe();

//     if (stripe) {
//       await stripe.redirectToCheckout({ sessionId });
//     }
//   }
// }
