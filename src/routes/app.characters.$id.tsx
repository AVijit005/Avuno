import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getCharacter } from "@/lib/characters";
import { CharacterProfile } from "@/components/character/CharacterProfile";
import { CharacterQuotes } from "@/components/character/CharacterQuotes";
import { Section } from "@/components/common/Section";
import { RelationshipPanel } from "@/components/profile/RelationshipPanel";
import { ShareCardPreview } from "@/components/share/ShareCardPreview";

export const Route = createFileRoute("/app/characters/$id")({
  loader: ({ params }) => {
    const character = getCharacter(params.id);
    if (!character) throw notFound();
    return { character };
  },
  component: CharacterPage,
});

import { useLibraryItem } from "@/hooks/use-library";

function CharacterPage() {
  const { character } = Route.useLoaderData() as {
    character: NonNullable<ReturnType<typeof getCharacter>>;
  };
  const { data: item } = useLibraryItem(character.mediaId);
  const media = item?.media ? { id: item.media.id, title: item.media.title, poster: item.media.posterUrl || undefined } : null;

  return (
    <div className="space-y-6 pb-16">
      <Link
        to="/app/characters"
        className="story-link inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All characters
      </Link>
      <CharacterProfile character={character} media={media} />
      <Section title="Quotes">
        <CharacterQuotes quotes={character.quotes ?? []} accent={character.accent} />
      </Section>
      <Section title="Connections">
        <RelationshipPanel kind="character" id={character.id} />
      </Section>
      <Section title="Share">
        <ShareCardPreview
          kind="character"
          title={character.name}
          subtitle={character.role}
          accent={character.accent}
        />
      </Section>
    </div>
  );
}
