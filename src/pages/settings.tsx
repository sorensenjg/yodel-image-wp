import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { validateApiKey } from "@/lib/api";
import { updateOptions } from "@/lib/wordpress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { LANGUAGES } from "@/config";

const { config, settings } = window.yodelImageAdmin;

const formSchema = z.object({
  yodel_api_key: z.string({
    required_error: "Yodel API key is required.",
  }),
  yodel_language: z.string(),
  yodel_svg_support: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export function SettingsPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yodel_api_key: settings.apiKey,
      yodel_language: settings.language,
      yodel_svg_support: settings.svgSupport,
    },
  });

  async function onSubmit(values: FormData) {
    if (values.yodel_api_key && values.yodel_api_key !== settings.apiKey) {
      const isValid = await validateApiKey(values.yodel_api_key);

      if (!isValid) {
        toast.error("Invalid API key");
        return;
      }
    }

    const { success } = await updateOptions(values);

    if (success) {
      toast.success("Successfully updated settings");

      if (values.yodel_api_key !== settings.apiKey) {
        window.location.reload();
      }
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="yodel_api_key"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">API Key</FormLabel>
                      <FormDescription className="prose">
                        Retrieve your API key from your Yodel{" "}
                        <a
                          href={`${config.apiUrl}/app`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          account settings
                        </a>{" "}
                        or{" "}
                        <a
                          href={`${config.apiUrl}/signup`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          create an account
                        </a>{" "}
                        to obtain one.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yodel_language"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Language</FormLabel>
                      <FormDescription className="prose">
                        This will generate image metadata in the selected
                        language.
                      </FormDescription>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yodel_svg_support"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">SVG Support</FormLabel>
                      <FormDescription className="prose">
                        Enabling this option will allow SVG images to be
                        uploaded to WordPress and allows you to use SVG image
                        generation models.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
