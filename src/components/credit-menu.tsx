import { cn } from "@/lib/utils";
import { useCredits } from "@/lib/api";
import { Button } from "@/components/ui/button";

const { config } = window.yodelImageAdmin;

interface CreditMenuProps {
  className?: string;
}

export function CreditMenu({ className }: CreditMenuProps) {
  const { data: credits, status } = useCredits();

  if (status === "pending") {
    return null;
  }

  const queryParams = new URLSearchParams();
  queryParams.set("success_url", window.location.href);
  queryParams.set("cancel_url", window.location.href);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <p>
        <span className="hidden sm:inline">Credits:</span> {credits}
      </p>
      <Button size="xs" asChild>
        <a
          className="text-white hover:text-white"
          href={`${config.apiUrl}/pricing?${queryParams.toString()}`}
        >
          <span className="hidden sm:inline">Buy&nbsp;</span> Credits
        </a>
      </Button>
    </div>
  );
}
