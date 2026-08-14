import { type ImgHTMLAttributes } from "react";

const illustrationBase =
  "select-none pointer-events-none object-contain w-40 h-40 opacity-80 drop-shadow-[0_0_24px_rgba(109,95,204,0.15)]";

export function LibraryIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-library-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function JournalIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-empty-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function MemoryIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-memory-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function TimelineIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-timeline-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function SearchIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-search-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function ErrorIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-error-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function NotFoundIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-404-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function OnboardingIllustration({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-onboarding-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function WelcomeIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-welcome-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}

export function NoDataIllustration({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/illustrations/storyset-no-data-1.svg"
      alt=""
      draggable={false}
      className={`${illustrationBase} ${className ?? ""}`}
      {...props}
    />
  );
}
