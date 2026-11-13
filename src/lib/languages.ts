/**
 * Languages people can say they speak — SHARED file.
 *
 * Codes are ISO 639-1. The flag is only a visual hint for the language (F11), not a nationality.
 * shortcut: emoji flags show as two letters on Windows; switch to the `flag-icons` package if that matters.
 */
export const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "wo", label: "Wolof", flag: "🇸🇳" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
