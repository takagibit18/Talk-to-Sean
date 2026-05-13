export type Locale = "zh" | "en";

export function parseLocale(value: string | null | undefined): Locale {
  return value === "zh" ? "zh" : "en";
}

export function localeFromAcceptLanguage(value: string | null | undefined): Locale {
  if (!value) return "en";
  return value.toLowerCase().includes("zh") ? "zh" : "en";
}
