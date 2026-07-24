// Universal share card — pure SVG strings, no deps, deterministic.
export interface ShareCardInput {
  kind: string;
  title: string;
  subtitle?: string;
  accent?: string;
  footer?: string;
}

export function renderShareCardSVG({
  kind,
  title,
  subtitle,
  accent = "oklch(0.72 0.18 255)",
  footer = "Chronicle",
}: ShareCardInput): string {
  const safe = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b0d12"/>
        <stop offset="1" stop-color="#101521"/>
      </linearGradient>
      <radialGradient id="halo" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0" stop-color="${accent}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg)"/>
    <rect width="1080" height="1080" fill="url(#halo)"/>
    <rect x="60" y="60" width="960" height="960" rx="56" ry="56" fill="none"
      stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="90" y="170" font-family="ui-sans-serif,-apple-system,Inter" font-size="22"
      fill="rgba(255,255,255,0.6)" letter-spacing="6">${safe(kind.toUpperCase())}</text>
    <foreignObject x="90" y="220" width="900" height="640">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="font-family:ui-sans-serif,-apple-system,Inter;color:#fff;font-size:84px;line-height:1.05;letter-spacing:-0.02em;font-weight:600">
        ${safe(title)}
      </div>
    </foreignObject>
    ${
      subtitle
        ? `<text x="90" y="920" font-family="ui-sans-serif,Inter" font-size="28"
      fill="rgba(255,255,255,0.7)">${safe(subtitle)}</text>`
        : ""
    }
    <text x="90" y="990" font-family="ui-sans-serif,Inter" font-size="22"
      fill="rgba(255,255,255,0.4)" letter-spacing="4">${safe(footer.toUpperCase())}</text>
  </svg>`;
}

export function shareCardDataUrl(input: ShareCardInput): string {
  const svg = renderShareCardSVG(input);
  if (typeof window === "undefined") {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
