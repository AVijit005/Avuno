import { useEffect, useState } from "react";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export function useTimeOfDay(): TimeOfDay {
  const [t, setT] = useState<TimeOfDay>(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return "morning";
    if (h >= 11 && h < 17) return "afternoon";
    if (h >= 17 && h < 21) return "evening";
    return "night";
  });
  useEffect(() => {
    const compute = (): TimeOfDay => {
      const h = new Date().getHours();
      if (h >= 5 && h < 11) return "morning";
      if (h >= 11 && h < 17) return "afternoon";
      if (h >= 17 && h < 21) return "evening";
      return "night";
    };
    const id = setInterval(() => {
      setT((prev) => {
        const next = compute();
        return prev === next ? prev : next;
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export const timeOfDayTint: Record<TimeOfDay, string> = {
  morning: "oklch(0.78 0.14 70)",
  afternoon: "oklch(0.7 0.1 250)",
  evening: "oklch(0.7 0.18 35)",
  night: "oklch(0.55 0.2 270)",
};
