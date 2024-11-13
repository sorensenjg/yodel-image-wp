import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, CircleHelpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const imageStyleGroups = {
  "General Art Styles": [
    "Realistic",
    "Hyperrealistic",
    "Photorealistic",
    "Impressionist",
    "Abstract",
    "Surrealist",
    "Expressionist",
    "Cubist",
    "Pop Art",
    "Minimalist",
    "Futuristic",
    "Vintage/Retro",
    "Classic/Traditional",
    "Concept Art",
    "High Fantasy",
  ],
  "Photography Styles": [
    "Cinematic",
    "Documentary",
    "Portrait",
    "Street Photography",
    "Landscape",
    "Macro",
    "Black and White",
    "Film Noir",
    "Drone/Aerial",
    "Soft Focus",
    "HDR (High Dynamic Range)",
    "Night Photography",
    "Golden Hour",
    "Cyberpunk",
    "Low-key (dark, high contrast)",
  ],
  "Illustration and Digital Art Styles": [
    "Anime/Manga",
    "Comic Book",
    "Pixel Art",
    "Watercolor",
    "Line Art",
    "Digital Painting",
    "Vector Art",
    "Graffiti/Street Art",
    "Steampunk",
    "Low Poly",
    "Fantasy Art",
    "Cyber Art",
    "Vaporwave",
    "Synthwave",
    "Flat Design",
  ],
  "Period Art Movements and Styles": [
    "Renaissance",
    "Baroque",
    "Art Nouveau",
    "Art Deco",
    "Bauhaus",
    "Victorian",
    "Gothic",
    "Medieval",
    "20th Century Modernism",
    "Post-Impressionist",
  ],
  "Mood and Tone Styles": [
    "Moody/Dramatic",
    "Ethereal",
    "Whimsical",
    "Dreamlike",
    "Dark Fantasy",
    "Mystical",
    "Colorful/High Saturation",
    "Calm and Serene",
    "Melancholic",
    "Playful/Childlike",
  ],
  "Other Style Modifiers": [
    "High Detail",
    "Soft Lighting",
    "Bokeh",
    "Long Exposure",
    "Isometric",
    "Retro-Futuristic",
    "Sci-Fi",
    "Illustrative",
    "Technical Drawing",
    "3D Render",
  ],
  "Environment and Landscape Styles": [
    "Urban Decay",
    "Futuristic Cityscape",
    "Nature-Inspired",
    "Dystopian",
    "Post-Apocalyptic",
    "Tropical",
    "Frozen Landscapes",
    "Underwater",
    "Space/Intergalactic",
    "Haunted/Spooky",
  ],
};

export function ImageStyleSelector() {
  const [open, setOpen] = useState(false);
  const form = useFormContext();

  if (!form) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="imageStyle"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <FormLabel className="flex items-center gap-2">
                Style <CircleHelpIcon className="h-4 w-4" />
              </FormLabel>
            </HoverCardTrigger>
            <HoverCardContent className="prose w-[320px] text-sm" side="left">
              <p>
                The <b>Style</b> modifier helps shape how your image looks. It
                guides the overall appearance, the feeling, and the mood of the
                image.
              </p>
            </HoverCardContent>
          </HoverCard>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? field.value : "Select an image style"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-[350px] p-0" align="end">
              <Command>
                <CommandInput
                  className="h-8 my-2"
                  placeholder="Search styles..."
                />
                <CommandList>
                  <CommandEmpty>No style found.</CommandEmpty>
                  <CommandGroup>
                    {Object.entries(imageStyleGroups).map(([_, styles]) =>
                      styles.map((style) => (
                        <CommandItem
                          value={style}
                          key={style}
                          onSelect={() => {
                            if (style === field.value) {
                              form.setValue("imageStyle", undefined);
                            } else {
                              form.setValue("imageStyle", style);
                            }
                            setOpen(false);
                          }}
                        >
                          {style}
                          <Check
                            className={cn(
                              "ml-auto",
                              style === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
