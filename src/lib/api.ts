import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getStripe } from "@/lib/stripe";

const { config } = window.yodelImageAdmin;

export function useAccount() {
  const { data } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await axios.get(`${config.apiUrl}/account`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      });
      return response.data;
    },
  });

  return data;
}

export async function createCheckoutSession(
  quantity: number,
  customerId: string | null,
  callbackUrl: string
) {
  const response = await axios.post(
    `${config.apiUrl}/create-checkout-session`,
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

export async function generateMetadata(imageUrl: string, cost: number) {
  try {
    const response = await axios.post(`${config.apiUrl}/image/metadata`, {
      imageUrl,
      cost,
    });

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    // const queryClient = useQueryClient();
    // queryClient.invalidateQueries({ queryKey: ["account"] });

    return response.data;
  } catch (error) {
    console.error("Error creating metadata prediction:", error);
    throw error;
  }
}
