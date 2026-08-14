import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";

export const Route = createFileRoute("/app/search")({ component: Page });

function Page() {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const mac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
    setIsMac(mac);
    const ev = new KeyboardEvent("keydown", { key: "k", metaKey: mac, ctrlKey: !mac });
    window.dispatchEvent(ev);
  }, []);

  return (
    <div className="pt-2">
      <div className="text-eyebrow mb-2">Search</div>
      <EmptyState
        illustration={<Search className="h-6 w-6" />}
        title={`Press ${isMac ? "⌘K" : "Ctrl+K"}`}
        description="Spotlight searches every corner of your Avuno."
      />
    </div>
  );
}
