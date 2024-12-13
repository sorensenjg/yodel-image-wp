import { BugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const { config } = window.yodelImageAdmin;

export function IssueButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="hidden sm:inline-flex"
          variant="ghost"
          size="icon-xs"
          asChild
        >
          <a
            href={`${config.apiUrl}/contact?topic=product_support&product=yodel_image`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Issues</span>
            <BugIcon aria-hidden="true" className="w-4 h-4" />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Report an issue</p>
      </TooltipContent>
    </Tooltip>
  );
}
