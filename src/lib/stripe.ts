import { Stripe, loadStripe } from "@stripe/stripe-js";

const { config } = window.yodelImageAdmin;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripePublicKey ?? "");
  }

  return stripePromise;
};
