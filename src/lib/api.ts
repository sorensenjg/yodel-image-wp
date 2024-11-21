import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { getStripe } from "@/lib/stripe";

const { config, settings } = window.yodelImageAdmin;

export function useAccount(initialData: { credits: number }) {
  const result = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await axios.get(`${config.apiUrl}/api/account`, {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
      });
      return response.data;
    },
    initialData,
  });

  return result;
}

export function useCredits() {
  const result = useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const response = await axios.get(`${config.apiUrl}/api/account`, {
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
  outputQuantity,
  seed,
}: {
  model: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  outputFormat?: string;
  outputQuality?: number;
  outputQuantity?: number;
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
        outputQuantity,
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

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export function useGenerateImage() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["account"] });
    },
  });

  return mutation;
}

export async function generateMetadata({
  image,
  cost,
}: {
  image: string;
  cost: number;
}) {
  try {
    const response = await axios.post(
      `${config.apiUrl}/api/v1/generate/metadata`,
      { image, cost },
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
      client.invalidateQueries({ queryKey: ["account"] });
    },
  });

  return mutation;
}

export async function createCheckoutSession(
  quantity: number,
  customerId: string | null,
  callbackUrl: string
) {
  const response = await axios.post(
    `${config.apiUrl}/api/create-checkout-session`,
    {
      quantity,
      customerId,
      callbackUrl,
    }
  );

  return response.data;
}

export async function purchaseCredits(
  quantity: number,
  customerId: string,
  callbackUrl: string
) {
  const { id: sessionId, signupUrl } = await createCheckoutSession(
    quantity,
    customerId,
    callbackUrl
  );

  if (signupUrl) {
    window.location.href = signupUrl;
  } else {
    const stripe = await getStripe();

    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  }
}
