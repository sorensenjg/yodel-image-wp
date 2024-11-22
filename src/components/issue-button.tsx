import { Link } from "react-router-dom";
import { BugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <Link
            to="https://github.com/sorensenjg/yodel-image/issues"
            target="_blank"
          >
            <span className="sr-only">Issues</span>
            <BugIcon aria-hidden="true" className="w-4 h-4" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Report an issue</p>
      </TooltipContent>
    </Tooltip>
  );
}
