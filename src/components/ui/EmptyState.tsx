import { type ReactNode, cloneElement, isValidElement } from "react";

interface Props {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ illustration, title, description, action, className = "" }: Props) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-6 md:p-8 text-center max-w-sm mx-auto ${className}`}
    >
      {illustration && (
        <div className="mb-6 grid place-items-center animate-slow-float">
          {isValidElement(illustration)
            ? cloneElement(illustration as React.ReactElement<{ className?: string }>, {
                className: "w-full max-h-40",
              })
            : illustration}
        </div>
      )}
      <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{action}</div>
      )}
    </div>
  );
}
