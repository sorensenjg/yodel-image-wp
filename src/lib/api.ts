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

export async function generateImage({
  model,
  prompt,
  aspectRatio,
  outputFormat,
  outputQuality,
  outputQuantity,
  seed,
}: {
  model: string;
  prompt: string;
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
        responseType: "blob",
      }
    );

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
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
