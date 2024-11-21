import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const aspectRatios = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
];

export function AspectRatioSelector() {
  const form = useFormContext();

  if (!form) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="aspectRatio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Aspect Ratio</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an aspect ratio" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {aspectRatios.map((ratio) => (
                <SelectItem key={ratio} value={ratio}>
                  {ratio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
