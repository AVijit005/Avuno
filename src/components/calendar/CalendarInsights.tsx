import { Sparkles } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { toast } from "sonner";

function downloadAsImage() {
  const script = document.createElement('script');
  script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
  script.onload = () => {
    // @ts-ignore
    window.html2canvas(document.body, { backgroundColor: '#090a0f' }).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = 'chronicle-calendar.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };
  document.head.appendChild(script);
}

interface Props {
  insights?: string[];
}

export function CalendarInsights({ insights: propInsights }: Props) {
  const insightLines = propInsights?.length ? propInsights : [];

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {insightLines.map((line: any, i: any) => (
          <PremiumGlass key={i} interactive variant="subtle"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="flex items-start gap-4 p-5 cursor-pointer press-scale relative z-10">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06]"><Sparkles className="h-4 w-4 text-primary" /></div>
            <p className="text-sm text-foreground/90">{line}</p>
          </PremiumGlass>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <PremiumButton variant="secondary" size="sm" onClick={downloadAsImage}>Download year as image</PremiumButton>
      </div>
    </>
  );
}
