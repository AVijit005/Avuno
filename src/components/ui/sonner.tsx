import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      offset={24}
      mobileOffset={96}
      gap={10}
      duration={4500}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: [
            "group toast",
            "!rounded-2xl !border !border-foreground/10",
            "!bg-[color:color-mix(in_oklab,var(--popover)_82%,transparent)]",
            "!backdrop-blur-xl !text-foreground",
            "!shadow-[0_24px_60px_-24px_oklch(0_0_0/0.7),inset_0_1px_0_oklch(1_0_0/0.06)]",
            "!px-4 !py-3.5",
          ].join(" "),
          title: "text-sm font-medium",
          description: "!text-muted-foreground text-xs leading-relaxed",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg !text-xs !font-medium",
          cancelButton: "!bg-foreground/5 !text-muted-foreground !rounded-lg !text-xs",
          closeButton:
            "!bg-foreground/5 !border-foreground/10 !text-muted-foreground hover:!bg-foreground/10",
          success: "!text-foreground",
          error: "!text-foreground",
          info: "!text-foreground",
          warning: "!text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
