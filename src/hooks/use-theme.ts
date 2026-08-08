import { useState, useEffect } from "react";

let isLightMode = false;
let observers = 0;
let observer: MutationObserver | null = null;
const listeners = new Set<(isLight: boolean) => void>();

function updateTheme() {
  if (typeof window === "undefined") return;
  const current = document.documentElement.classList.contains("light");
  if (current !== isLightMode) {
    isLightMode = current;
    listeners.forEach((l) => l(isLightMode));
  }
}

export function useTheme() {
  const [isLight, setIsLight] = useState(isLightMode);

  useEffect(() => {
    // Initial check
    setIsLight(document.documentElement.classList.contains("light"));

    if (observers === 0) {
      isLightMode = document.documentElement.classList.contains("light");
      observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    observers++;
    listeners.add(setIsLight);

    return () => {
      listeners.delete(setIsLight);
      observers--;
      if (observers === 0 && observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }, []);

  return { isLight };
}
