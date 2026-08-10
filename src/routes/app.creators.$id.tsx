import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { buildCreatorProfile } from "@/lib/creatorEngine";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { CreatorWorks } from "@/components/creator/CreatorWorks";
import { Section } from "@/components/common/Section";

import { ShareCardPreview } from "@/components/share/ShareCardPreview";

export const Route = createFileRoute("/app/creators/$id")({
  loader: ({ params }) => {
    const profile = buildCreatorProfile(params.id);
    if (!profile) throw notFound();
    return { profile };
  },
  component: CreatorPage,
});

function CreatorPage() {
  const { profile } = Route.useLoaderData() as {
    profile: NonNullable<ReturnType<typeof buildCreatorProfile>>;
  };
  return (
    <div className="space-y-6 pb-16">
      <Link
        to="/app/creators"
        className="story-link inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All creators
      </Link>
      <CreatorHeader creator={profile.creator} stats={profile.stats} />
      <Section title="Works in your library" subtitle={`${profile.works.length} entries`}>
        <CreatorWorks works={profile.works} />
      </Section>
      {profile.collections.length > 0 && (
        <Section title="Collections featuring this creator">
          <div className="flex flex-wrap gap-2 text-xs">
            {profile.collections.map((c) => (
              <Link
                key={c.id}
                to="/app/collections/$id"
                params={{ id: c.id }}
                className="glass-subtle rounded-full px-3 py-1.5 uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Section>
      )}
      <Section title="Share">
        <ShareCardPreview
          kind="creator"
          title={profile.creator.name}
          subtitle={profile.creator.bio}
          accent={profile.creator.accent}
        />
      </Section>
    </div>
  );
}
