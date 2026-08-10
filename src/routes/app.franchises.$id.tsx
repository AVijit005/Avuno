import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { buildFranchiseProfile } from "@/lib/franchiseEngine";
import { FranchiseHero } from "@/components/franchise/FranchiseHero";
import { FranchiseTimeline } from "@/components/franchise/FranchiseTimeline";
import { FranchiseEntries } from "@/components/franchise/FranchiseEntries";
import { Section } from "@/components/common/Section";

import { ShareCardPreview } from "@/components/share/ShareCardPreview";

export const Route = createFileRoute("/app/franchises/$id")({
  loader: ({ params }) => {
    const profile = buildFranchiseProfile(params.id);
    if (!profile) throw notFound();
    return { profile };
  },
  component: FranchisePage,
});

function FranchisePage() {
  const { profile } = Route.useLoaderData() as {
    profile: NonNullable<ReturnType<typeof buildFranchiseProfile>>;
  };
  return (
    <div className="space-y-6 pb-16">
      <Link
        to="/app/franchises"
        className="story-link inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All franchises
      </Link>
      <FranchiseHero franchise={profile.franchise} completion={profile.completion} />
      <Section title="Entries">
        <FranchiseEntries entries={profile.entries} />
      </Section>
      <Section title="Timeline">
        <FranchiseTimeline events={profile.timeline} />
      </Section>
      <Section title="Share">
        <ShareCardPreview
          kind="franchise"
          title={profile.franchise.name}
          subtitle={profile.franchise.description}
          accent={profile.franchise.accent}
        />
      </Section>
    </div>
  );
}
