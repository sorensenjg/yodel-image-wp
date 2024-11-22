import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { updateOptions } from "@/lib/wordpress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormButton,
} from "@/components/ui/form";

const formSchema = z.object({
  yodel_image_api_key: z.string({
    required_error: "Yodel API key is required.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function SettingsPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yodel_image_api_key: window.yodelImageAdmin.settings.apiKey,
    },
  });

  async function onSubmit(values: FormData) {
    const { success } = await updateOptions(values);

    if (success) {
      toast.success("Successfully updated settings");
    } else {
      toast.error("Failed to update settings");
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="container p-0">
          <div className="container px-5 flex justify-between items-center gap-2 py-4">
            <h2 className="text-lg font-semibold whitespace-nowrap">
              Settings
            </h2>
            <div className="ml-auto flex space-x-2"></div>
          </div>
        </div>
        <Separator />
        <div className="container flex-1 py-6 overflow-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="yodel_image_api_key"
                render={({ field }) => (
                  <FormItem className="w-full max-w-md">
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="prose">
                      Retrieve your API key from your Yodel{" "}
                      <a href={`${window.yodelImageAdmin.config.apiUrl}/app`}>
                        account settings
                      </a>{" "}
                      or{" "}
                      <a
                        href={`${window.yodelImageAdmin.config.apiUrl}/signup`}
                      >
                        create an account
                      </a>{" "}
                      to obtain one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormButton>Save</FormButton>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
