import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAccount, purchaseCredits } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormButton,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  quantity: z
    .number({
      required_error: "Quantity is required.",
    })
    .min(10, "Minimum quantity is 10."),
});

type FormData = z.infer<typeof formSchema>;

export function Credits() {
  const [credits, setCredits] = useState(0);
  const account = useAccount();

  useEffect(() => {
    if (account) {
      setCredits(account.credits);
    }
  }, [account]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 20,
    },
  });
  const quantityValue = form.watch("quantity");

  async function onSubmit(values: FormData) {
    await purchaseCredits(
      values.quantity,
      account.customer_id,
      window.location.href
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3">
          <p>
            <span className="hidden sm:inline">Credits:</span> {credits}
          </p>
          <Button size="xs">
            <span className="hidden sm:inline">Buy&nbsp;</span> Credits
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Credits are used to run AI processes and other related services.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex justify-between items-end gap-2"
            >
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-full"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-muted-foreground">
                  ${quantityValue * 0.2}
                </p>
                <FormButton>Checkout</FormButton>
              </div>
            </form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
