/**
 * Languages people can say they speak — SHARED file.
 *
 * Chosen for who actually lives in and arrives to the Canary Islands: the languages of Spain,
 * of the European residents, and of the communities from North and West Africa, Latin America,
 * Eastern Europe and Asia (the islands have a large Sindhi and Indian community, for example).
 *
 * - `label` is the language's own name, so someone can find their language even if they do not
 *   read Spanish yet. `name` is the Spanish name, shown underneath for everyone else.
 * - `code` is ISO 639-1, or ISO 639-3 when a language has no two-letter code (zgh, ssp).
 * - `flag` is only a visual hint for the language (F11), never a nationality. Languages with no
 *   country of their own get a symbol instead: ⵣ for Tamazight, 🤟 for sign language. Catalan,
 *   Galician and Basque have no emoji flag, so theirs is a path to an SVG in public/flags/ (see <Flag>).
 *
 * shortcut: emoji flags show as two letters on Windows; switch to the `flag-icons` package if that matters.
 */
export const LANGUAGES = [
  // Spain
  { code: "es", label: "Español", name: "Español", flag: "🇪🇸" },
  { code: "ssp", label: "Lengua de signos", name: "Lengua de signos española", flag: "🤟" },
  { code: "ca", label: "Català", name: "Catalán", flag: "/flags/ca.svg" },
  { code: "gl", label: "Galego", name: "Gallego", flag: "/flags/gl.svg" },
  { code: "eu", label: "Euskara", name: "Euskera", flag: "/flags/eu.svg" },
  // Europe
  { code: "en", label: "English", name: "Inglés", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", name: "Alemán", flag: "🇩🇪" },
  { code: "fr", label: "Français", name: "Francés", flag: "🇫🇷" },
  { code: "it", label: "Italiano", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", name: "Portugués", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", name: "Neerlandés", flag: "🇳🇱" },
  { code: "sv", label: "Svenska", name: "Sueco", flag: "🇸🇪" },
  { code: "no", label: "Norsk", name: "Noruego", flag: "🇳🇴" },
  { code: "da", label: "Dansk", name: "Danés", flag: "🇩🇰" },
  { code: "fi", label: "Suomi", name: "Finés", flag: "🇫🇮" },
  { code: "pl", label: "Polski", name: "Polaco", flag: "🇵🇱" },
  { code: "ro", label: "Română", name: "Rumano", flag: "🇷🇴" },
  { code: "uk", label: "Українська", name: "Ucraniano", flag: "🇺🇦" },
  { code: "ru", label: "Русский", name: "Ruso", flag: "🇷🇺" },
  // North and West Africa
  { code: "ar", label: "العربية", name: "Árabe", flag: "🇲🇦" },
  { code: "zgh", label: "ⵜⴰⵎⴰⵣⵉⵖⵜ", name: "Tamazight (bereber)", flag: "ⵣ" },
  { code: "wo", label: "Wolof", name: "Wolof", flag: "🇸🇳" },
  { code: "ff", label: "Pulaar", name: "Fula (pular)", flag: "🇬🇳" },
  { code: "bm", label: "Bamanankan", name: "Bambara", flag: "🇲🇱" },
  // Asia
  { code: "zh", label: "中文", name: "Chino", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", name: "Hindi", flag: "🇮🇳" },
  { code: "sd", label: "سنڌي", name: "Sindhi", flag: "🇮🇳" },
  { code: "ur", label: "اردو", name: "Urdu", flag: "🇵🇰" },
  { code: "bn", label: "বাংলা", name: "Bengalí", flag: "🇧🇩" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
