"use client";

import { useState, useRef } from "react";
import { PopoverProps } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useServices } from "@/lib/api";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// import { Model } from "../data/models";

type Model = any;

interface ModelSelectorProps extends PopoverProps {
  // types: readonly ModelType[];
  models: Model[];
}

export function ModelSelector({
  models, // types,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  // const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  // const [peekedModel, setPeekedModel] = useState<Model>(models[0]);
  const form = useFormContext();

  if (!form) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Model</FormLabel>
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
                  {field.value
                    ? models.find((model: any) => model.id === field.value)
                        ?.name
                    : "Select an image model"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-[350px] p-0" align="end">
              <Command>
                <CommandInput
                  className="h-8 my-2"
                  placeholder="Search models..."
                />
                <CommandList>
                  <CommandEmpty>No model found.</CommandEmpty>
                  <CommandGroup>
                    {models.map((model: any) => (
                      <CommandItem
                        key={model.id}
                        value={model.id}
                        onSelect={() => {
                          form.setValue("model", model.id);
                          setOpen(false);
                        }}
                      >
                        {model.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            model.id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
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

  // return (
  //   <div className="grid gap-2">
  //     <HoverCard openDelay={200}>
  //       <HoverCardTrigger asChild>
  //         <Label htmlFor="model">Model</Label>
  //       </HoverCardTrigger>
  //       <HoverCardContent
  //         align="start"
  //         className="w-[260px] text-sm"
  //         side="left"
  //       >
  //         The model which will generate the completion. Some models are suitable
  //         for natural language tasks, others specialize in code. Learn more.
  //       </HoverCardContent>
  //     </HoverCard>
  //     <Popover open={open} onOpenChange={setOpen} {...props}>
  //       <PopoverTrigger asChild>
  //         <Button
  //           variant="outline"
  //           role="combobox"
  //           aria-expanded={open}
  //           aria-label="Select a model"
  //           className="w-full justify-between"
  //         >
  //           {selectedModel ? selectedModel.name : "Select a model..."}
  //           <ChevronsUpDown className="w-4 h-4 opacity-50" />
  //         </Button>
  //       </PopoverTrigger>
  //       <PopoverContent className="w-screen max-w-[350px] p-0" align="end">
  //         <HoverCard>
  //           <HoverCardContent
  //             side="left"
  //             align="start"
  //             forceMount
  //             className="min-h-[280px]"
  //           >
  //             <div className="grid gap-2">
  //               <h4 className="font-medium leading-none">{peekedModel.name}</h4>
  //               <div className="text-sm text-muted-foreground">
  //                 {peekedModel.description}
  //               </div>
  //               {peekedModel.strengths ? (
  //                 <div className="mt-4 grid gap-2">
  //                   <h5 className="text-sm font-medium leading-none">
  //                     Strengths
  //                   </h5>
  //                   <ul className="text-sm text-muted-foreground">
  //                     {peekedModel.strengths}
  //                   </ul>
  //                 </div>
  //               ) : null}
  //             </div>
  //           </HoverCardContent>
  //           <Command loop>
  //             <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px] ">
  //               <CommandInput
  //                 className="h-8 my-2"
  //                 placeholder="Search Models..."
  //               />
  //               <CommandEmpty>No Models found.</CommandEmpty>
  //               <HoverCardTrigger />
  //               {imageModels.map((model: any) => (
  //                 <ModelItem
  //                   key={model.id}
  //                   model={model}
  //                   isSelected={selectedModel?.id === model.id}
  //                   onPeek={(model) => setPeekedModel(model)}
  //                   onSelect={() => {
  //                     setSelectedModel(model);
  //                     setOpen(false);
  //                   }}
  //                 />
  //               ))}

  //               {/* {types.map((type) => (
  //                 <CommandGroup key={type} heading={type}>
  //                   {models
  //                     .filter((model) => model.type === type)
  //                     .map((model) => (
  //                       <ModelItem
  //                         key={model.id}
  //                         model={model}
  //                         isSelected={selectedModel?.id === model.id}
  //                         onPeek={(model) => setPeekedModel(model)}
  //                         onSelect={() => {
  //                           setSelectedModel(model);
  //                           setOpen(false);
  //                         }}
  //                       />
  //                     ))}
  //                 </CommandGroup>
  //               ))} */}
  //             </CommandList>
  //           </Command>
  //         </HoverCard>
  //       </PopoverContent>
  //     </Popover>
  //   </div>
  // );
}

// interface ModelItemProps {
//   model: Model;
//   isSelected: boolean;
//   onSelect: () => void;
//   onPeek: (model: Model) => void;
// }

// function ModelItem({ model, isSelected, onSelect, onPeek }: ModelItemProps) {
//   const ref = useRef<HTMLDivElement>(null);

//   useMutationObserver(ref, (mutations) => {
//     mutations.forEach((mutation) => {
//       if (
//         mutation.type === "attributes" &&
//         mutation.attributeName === "aria-selected" &&
//         ref.current?.getAttribute("aria-selected") === "true"
//       ) {
//         onPeek(model);
//       }
//     });
//   });

//   return (
//     <CommandItem
//       key={model.id}
//       onSelect={onSelect}
//       ref={ref}
//       className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
//     >
//       {model.name}
//       <Check
//         className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
//       />
//     </CommandItem>
//   );
// }
