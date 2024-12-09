import { useFormContext } from "react-hook-form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function OutputQuantitySelector() {
  const form = useFormContext();

  if (!form) {
    return null;
  }

  const value = form.watch("outputQuantity");

  return (
    <div className="grid gap-2 pt-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxlength">Output Quantity</Label>
              <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                {value}
              </span>
            </div>
            <FormField
              control={form.control}
              name="outputQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Output Quantity</FormLabel>
                  <FormControl>
                    <Slider
                      className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                      step={1}
                      min={1}
                      max={4}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      aria-label="Output quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          The number of images to generate at once.
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
