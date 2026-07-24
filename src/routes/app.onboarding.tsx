import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Film, Tv, BookOpen, Gamepad2, Headphones, Check, ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";

export const Route = createFileRoute("/app/onboarding")({ component: OnboardingPage });

const MEDIA_TYPES = [
  { id: "movies", label: "Movies", icon: Film, accent: "var(--primary)" },
  { id: "shows", label: "TV Shows", icon: Tv, accent: "oklch(0.65 0.22 295)" },
  { id: "books", label: "Books", icon: BookOpen, accent: "oklch(0.7 0.18 25)" },
  { id: "games", label: "Games", icon: Gamepad2, accent: "oklch(0.82 0.16 80)" },
  { id: "music", label: "Music & Podcasts", icon: Headphones, accent: "oklch(0.72 0.16 160)" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && selected.length > 0) {
      setStep(2);
    } else if (step === 2) {
      localStorage.setItem("chronicle_onboarding_complete", "true");
      localStorage.setItem("chronicle_media_types", JSON.stringify(selected));
      analytics.track("onboarding_complete", { types: selected });
      navigate({ to: "/app" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 pb-32">
      <PremiumGlass className="w-full max-w-2xl p-8 md:p-12" variant="strong">
        {step === 1 ? (
          <div className="animate-fade-blur-in">
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">
              What stories do you follow?
            </h1>
            <p className="mt-4 text-muted-foreground">
              Select the types of media you want to track in Chronicle. You can change this later.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {MEDIA_TYPES.map((t) => {
                const isActive = selected.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={`press-scale relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-6 transition-all duration-[var(--dur-normal)] ${
                      isActive ? "bg-white/[0.08] shadow-[0_0_20px_var(--accent)]" : "bg-black/20 hover:bg-white/[0.04]"
                    }`}
                    style={{ "--accent": t.accent } as any}
                  >
                    {isActive && (
                      <div className="absolute right-3 top-3">
                        <Check className="h-4 w-4" style={{ color: t.accent }} />
                      </div>
                    )}
                    <t.icon className="h-8 w-8 text-white/80" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-12 flex justify-end">
              <PremiumButton
                onClick={handleNext}
                disabled={selected.length === 0}
                className="gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </PremiumButton>
            </div>
          </div>
        ) : (
          <div className="animate-fade-blur-in text-center">
            <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full bg-white/[0.06]">
              <Film className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl tracking-tight md:text-5xl">
              Your library is ready.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Start by adding your first story. Search for a movie you recently watched, a book you're reading, or a game you love.
            </p>
            <div className="mt-10">
              <PremiumButton onClick={handleNext} size="lg">
                Enter Chronicle
              </PremiumButton>
            </div>
          </div>
        )}
      </PremiumGlass>
    </div>
  );
}
