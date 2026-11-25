export interface ThemeInfo {
  id: string;
  name: string;
  emoji: string;
  months?: number[];
}

export const THEMES: ThemeInfo[] = [
  { id: "padrao", name: "Padrão", emoji: "☀️" },
  { id: "natal", name: "Natal", emoji: "🎄", months: [11] },
  { id: "anonovo", name: "Ano Novo", emoji: "🎆", months: [0] },
  { id: "pascoa", name: "Páscoa", emoji: "🐰", months: [3, 4] },
  { id: "junina", name: "Festa Junina", emoji: "🌽", months: [5, 6] },
  { id: "verao", name: "Verão", emoji: "🏖️" },
  { id: "outono", name: "Outono", emoji: "🍂", months: [2, 3, 4] },
  { id: "inverno", name: "Inverno", emoji: "❄️", months: [5, 6, 7] },
  { id: "primavera", name: "Primavera", emoji: "🌸", months: [8, 9, 10] },
];

export const THEME_KEY = "portal-nova.themeSeason";

export function themeById(id: string): ThemeInfo {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function autoThemeIdFor(monthIndex: number): string {
  if (monthIndex === 11) return "natal";
  if (monthIndex === 0) return "anonovo";
  if (monthIndex === 3 || monthIndex === 4) return "pascoa";
  if (monthIndex === 5 || monthIndex === 6) return "junina";
  if (monthIndex >= 8 && monthIndex <= 10) return "primavera";
  if (monthIndex >= 2 && monthIndex <= 4) return "outono";
  if (monthIndex >= 5 && monthIndex <= 7) return "inverno";
  return "verao";
}

export function saveThemeChoice(id: string) {
  localStorage.setItem(THEME_KEY, id);
  applyThemeElement(id);
}

export function loadThemeChoice(): string {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
  if (stored && stored !== "auto") return themeById(stored).id;
  return "auto";
}

export function applyThemeElement(id: string) {
  const resolved = id === "auto" ? autoThemeIdFor(new Date().getMonth()) : id;
  if (resolved === "padrao") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", resolved);
  }
}

export function applyStoredTheme() {
  applyThemeElement(loadThemeChoice());
}
