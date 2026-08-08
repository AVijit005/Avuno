import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function IdentityHero() {
  return (
    <PremiumGlass variant="strong" className="p-8 text-center">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Your Profile
      </div>
      <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
        The story of your stories
      </h1>
      <p className="mt-3 mx-auto max-w-md text-sm text-muted-foreground">
        A living portrait of your media life — the patterns, the preferences, and the moments that
        shaped you.
      </p>
    </PremiumGlass>
  );
}
