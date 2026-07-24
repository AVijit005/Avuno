import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { apiPatch } from "@/lib/api/fetch";

export const Route = createFileRoute("/app/settings/email-capture")({
  component: EmailCapturePage,
});

function EmailCapturePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Use real API call
    apiPatch('/notifications/preferences', { marketingEnabled: true })
      .then(() => {
        toast.success("Thank you! We'll be in touch soon.");
        navigate({ to: "/app/settings" });
      })
      .catch((err) => {
        toast.error("Failed to update preferences.");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="mx-auto max-w-md pt-12">
      <button
        onClick={() => navigate({ to: "/pricing" })}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Pricing
      </button>

      <PremiumGlass className="p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl">Upgrade to Plus</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to get early access to Chronicle Plus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <PremiumButton
            className="w-full"
            loading={loading}
          >
            Request Access
          </PremiumButton>
        </form>
      </PremiumGlass>
    </div>
  );
}
