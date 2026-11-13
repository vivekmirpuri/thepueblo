/**
 * Meetup categories — SHARED file.
 *
 * The single list behind four things: a person's interests (onboarding and profile), the chip bar
 * above the map (F5), the category field of the event form (F8) and the icon on every event card.
 * Add or rename a category only here.
 *
 * `id` is code and stays English. `label` and `description` are shown to people, so they are
 * Spanish and written in lectura fácil: short sentences, everyday words.
 * `icon` is the category's drawing (an SVG from lucide-react); `emoji` is its fallback when there
 * is no room for an icon.
 */
import {
  BabyIcon,
  DicesIcon,
  DramaIcon,
  DumbbellIcon,
  Flower2Icon,
  HeartHandshakeIcon,
  LandmarkIcon,
  LanguagesIcon,
  LaptopIcon,
  MountainIcon,
  MusicIcon,
  PaletteIcon,
  UtensilsCrossedIcon,
  VoteIcon,
} from "lucide-react";

export const CATEGORIES = [
  { id: "sport", label: "Deporte", emoji: "⚽", icon: DumbbellIcon, description: "Jugar, entrenar o mover el cuerpo con otras personas." },
  { id: "outdoors", label: "Aire libre", emoji: "🥾", icon: MountainIcon, description: "Caminar por senderos, playa o montaña." },
  { id: "languages", label: "Idiomas", emoji: "💬", icon: LanguagesIcon, description: "Practicar idiomas hablando con otras personas." },
  { id: "debate", label: "Política y debate", emoji: "🗳️", icon: VoteIcon, description: "Hablar de lo que nos afecta, con respeto." },
  { id: "improv", label: "Impro y teatro", emoji: "🎭", icon: DramaIcon, description: "Teatro, improvisación y juegos de expresión." },
  { id: "music", label: "Música", emoji: "🎶", icon: MusicIcon, description: "Tocar, cantar o escuchar música juntas." },
  { id: "food", label: "Comida", emoji: "🍲", icon: UtensilsCrossedIcon, description: "Cocinar, comer juntas y compartir recetas." },
  { id: "tech", label: "Tecnología", emoji: "💻", icon: LaptopIcon, description: "Móviles, ordenadores e internet, para aprender." },
  { id: "arts", label: "Arte", emoji: "🎨", icon: PaletteIcon, description: "Pintar, dibujar o hacer cosas con las manos." },
  { id: "games", label: "Juegos", emoji: "🎲", icon: DicesIcon, description: "Juegos de mesa, cartas o videojuegos." },
  { id: "volunteering", label: "Voluntariado", emoji: "🤝", icon: HeartHandshakeIcon, description: "Echar una mano en tu barrio o en una asociación." },
  { id: "families", label: "Familias", emoji: "👨‍👩‍👧", icon: BabyIcon, description: "Planes para hacer con niñas y niños." },
  { id: "wellbeing", label: "Bienestar", emoji: "🧘", icon: Flower2Icon, description: "Cuidarte: yoga, relajación o salud." },
  { id: "culture", label: "Cultura", emoji: "🏛️", icon: LandmarkIcon, description: "Museos, fiestas y tradiciones de las islas." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const findCategory = (id: string) => CATEGORIES.find((category) => category.id === id);
