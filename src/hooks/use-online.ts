import { useState, useEffect } from "react";

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const go = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", go);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", go);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
