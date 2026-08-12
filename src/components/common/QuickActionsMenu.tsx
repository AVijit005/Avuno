import {
  MoreHorizontal,
  Play,
  NotebookPen,
  Clock,
  Layers,
  Share2,
  Heart,
  Pin,
  Archive,
  CheckCircle2,
  RotateCcw,
  ArrowDownToLine,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface QuickAction {
  label: string;
  icon: typeof Play;
  onSelect?: () => void;
}

export const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "Open", icon: Play },
  { label: "Resume", icon: Play },
  { label: "Favorite", icon: Heart },
  { label: "Journal", icon: NotebookPen },
  { label: "Timeline", icon: Clock },
  { label: "Add to collection", icon: Layers },
  { label: "Pin", icon: Pin },
  { label: "Mark complete", icon: CheckCircle2 },
  { label: "Rewatch", icon: RotateCcw },
  { label: "Plan later", icon: ArrowDownToLine },
  { label: "Share", icon: Share2 },
  { label: "Archive", icon: Archive },
];

export function QuickActionsMenu({
  actions = DEFAULT_ACTIONS,
  className,
  ariaLabel = "More actions",
}: {
  actions?: QuickAction[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={ariaLabel}
          className={cn(
            "grid h-11 w-11 sm:h-8 sm:w-8 place-items-center rounded-full bg-foreground/[0.04] text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-foreground/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.slice(0, 6).map((a) => (
          <DropdownMenuItem key={a.label} onSelect={a.onSelect}>
            <a.icon className="mr-2 h-4 w-4 text-muted-foreground" /> {a.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {actions.slice(6).map((a) => (
          <DropdownMenuItem key={a.label} onSelect={a.onSelect}>
            <a.icon className="mr-2 h-4 w-4 text-muted-foreground" /> {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
