import { useState } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumImageProps extends Omit<HTMLMotionProps<"img">, "src" | "alt"> {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "poster" | "auto";
  className?: string;
  wrapperClassName?: string;
}

const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  poster: "aspect-[2/3]",
  auto: "aspect-auto",
};

export function PremiumImage({
  src,
  alt,
  aspectRatio = "auto",
  className,
  wrapperClassName,
  ...props
}: PremiumImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/5",
        aspectClasses[aspectRatio],
        wrapperClassName,
      )}
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
          <ImageOff className="h-8 w-8 text-white/30" />
        </div>
      ) : (
        <>
          <motion.img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            initial={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            animate={loaded ? { opacity: 1, filter: "blur(0px)", scale: 1 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn("h-full w-full object-cover", className)}
            {...props}
          />
          {!loaded && <div className="absolute inset-0 animate-pulse bg-white/10" />}
        </>
      )}
    </div>
  );
}
