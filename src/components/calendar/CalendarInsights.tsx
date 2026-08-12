import { Sparkles } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { toast } from "sonner";

declare global {
  var html2canvas:
    | ((target: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>)
    | undefined;
}

function captureAndDownload() {
  const el = document.getElementById("calendar-insights-root");
  if (!el || !window.html2canvas) {
    toast.error("Failed to generate image.");
    return;
  }
  window
    .html2canvas(el, { backgroundColor: "#090a0f" })
    .then((canvas: HTMLCanvasElement) => {
      const link = document.createElement("a");
      link.download = "chronicle-calendar.png";
      link.href = canvas.toDataURL();
      link.click();
    })
    .catch(() => {
      toast.error("Failed to generate image.");
    });
}

function downloadAsImage() {
  if (typeof window === "undefined") return;
  if (window.html2canvas) {
    captureAndDownload();
    return;
  }
  const existing = document.querySelector('script[src*="html2canvas"]');
  if (existing) {
    captureAndDownload();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  script.integrity =
    "sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSK/6d101tGsAHZI/A94g==";
  script.crossOrigin = "anonymous";
  script.onload = () => captureAndDownload();
  script.onerror = () => toast.error("Failed to load image generator. Check your connection.");
  document.head.appendChild(script);
}

interface Props {
  insights?: string[];
}

export function CalendarInsights({ insights: propInsights }: Props) {
  const insightLines = propInsights?.length ? propInsights : [];

  return (
    <div id="calendar-insights-root">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {insightLines.map((line: string, i: number) => (
          <PremiumGlass
            key={i}
            interactive
            variant="subtle"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-start gap-4 p-5 cursor-pointer press-scale relative z-10"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground/5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-foreground/90">{line}</p>
          </PremiumGlass>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <PremiumButton variant="secondary" size="sm" onClick={downloadAsImage}>
          Download year as image
        </PremiumButton>
      </div>
    </div>
  );
}
