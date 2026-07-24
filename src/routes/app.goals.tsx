import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common/ComingSoon";

export const Route = createFileRoute("/app/goals")({ component: Page });

function Page() {
  return (
    <ComingSoon
      eyebrow="Goals"
      title="Quiet intentions."
      description="Set the year's reading pile, your film count, the games you owe yourself. Chronicle nudges, never nags."
    />
  );
}
