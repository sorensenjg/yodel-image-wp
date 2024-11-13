import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { useGenerateMetadata } from "@/lib/api";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CreditConfirmDialogProps extends ButtonProps {
  tooltip?: string;
  title?: string;
  description?: string;
  services: {
    name: string;
    cost: number;
    quantity: number;
  }[];
  onConfirm: () => void;
}

export function CreditConfirmDialog({
  children,
  tooltip,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  services = [],
  onConfirm,
}: CreditConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <TooltipProvider>
      <AlertDialog>
        <Tooltip>
          <AlertDialogTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </AlertDialogTrigger>
          {tooltip && (
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center sm:space-x-0">
            <div>
              {services.length > 0 && (
                <p className="font-bold">
                  <span>Cost:</span>{" "}
                  {services.reduce(
                    (acc, service) => acc + service.cost * service.quantity,
                    0
                  )}{" "}
                  Credits
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction type="button" onClick={handleConfirm}>
                Continue
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
