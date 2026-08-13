import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      offset={24}
      mobileOffset={80}
      gap={8}
      duration={4500}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: ["group toast", "glass-floating", "!rounded-2xl", "!px-4 !py-3.5"].join(" "),
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
