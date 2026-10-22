const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Everything that comes from map data or the user goes through this before
// it's interpolated into an HTML template.
export function esc(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

// The demo map's room names carry emoji ("Electrical Room ⚡️"). The panels
// show clean names like the Battersea reference; map labels keep them.
export function stripEmoji(name: string): string {
  return name
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Floor buttons are 40px circles, so they need short labels ("1F", "UGF" on
// Battersea). The demo map's shortName is just "Level 1", so derive "L1".
export function floorShortLabel(name: string, shortName?: string): string {
  const short = shortName?.trim();
  if (short && short !== name && short.length <= 4) return short;
  const level = /^level\s*(\d+)$/i.exec(name.trim());
  if (level) return `L${level[1]}`;
  if (name.length <= 3) return name;
  return name
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
