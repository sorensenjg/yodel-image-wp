// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { useAccount, purchaseCredits } from "@/lib/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormButton,
// } from "@/components/ui/form";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// const CENTS_PER_CREDIT = 1;

// const formSchema = z.object({
//   quantity: z
//     .number({
//       required_error: "Quantity is required.",
//     })
//     .min(1000, "Minimum quantity is 1000."),
// });

// type FormData = z.infer<typeof formSchema>;

// const { settings } = window.yodelImageAdmin;

// export function CreditMenu() {
//   const { data: account } = useAccount({ credits: 0 });

//   const form = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       quantity: 1000,
//     },
//   });
//   const quantityValue = form.watch("quantity");

//   async function onSubmit(values: FormData) {
//     await purchaseCredits(
//       values.quantity,
//       account?.customer_id,
//       window.location.href
//     );
//   }

//   if (!settings.apiKey) {
//     return null;
//   }

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <div className="flex items-center gap-3">
//           <p>
//             <span className="hidden sm:inline">Credits:</span>{" "}
//             {account?.credits}
//           </p>
//           <Button size="xs">
//             <span className="hidden sm:inline">Buy&nbsp;</span> Credits
//           </Button>
//         </div>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Purchase Credits</DialogTitle>
//           <DialogDescription>
//             Credits are used to run AI processes and other related services.
//           </DialogDescription>
//         </DialogHeader>
//         <DialogFooter>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(onSubmit)}
//               className="w-full flex justify-between items-end gap-2"
//             >
//               <FormField
//                 control={form.control}
//                 name="quantity"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Quantity</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         className="w-full"
//                         step={250}
//                         {...field}
//                         onChange={(e) => field.onChange(Number(e.target.value))}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="flex items-center gap-3">
//                 <p className="text-lg font-bold text-muted-foreground">
//                   {((quantityValue / 100) * CENTS_PER_CREDIT).toLocaleString(
//                     "en-US",
//                     {
//                       style: "currency",
//                       currency: "USD",
//                     }
//                   )}
//                 </p>
//                 <FormButton>Checkout</FormButton>
//               </div>
//             </form>
//           </Form>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
