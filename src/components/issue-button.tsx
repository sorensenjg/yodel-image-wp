import { Link } from "react-router-dom";
import { BugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function IssueButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-xs" asChild>
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
    </TooltipProvider>
  );
}
