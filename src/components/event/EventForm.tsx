"use client";
/**
 * The form to create an activity (F8) + similar-events check (F9) — Track B.
 * Built (not a placeholder).
 *
 * When the person types a title and description, a debounced search finds activities that
 * already exist with similar words (findSimilarEvents from src/lib/ai). If any are found, a
 * friendly panel appears suggesting the person joins one instead of creating a duplicate.
 *
 * The place is chosen by tapping the map, because searching an address would need a geocoding
 * service we do not have. Accessibility (F17) is part of the form, not an afterthought.
 *
 * Presentational: it holds the draft while you type and hands it over on submit; the page uploads
 * the image and writes to Firestore.
 */
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BotMessageSquareIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Bubble } from "@/components/shared/Bubble";
import { EventCard } from "@/components/shared/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, findCategory, type CategoryId } from "@/lib/categories";
import { INCLUSION, type InclusionId } from "@/lib/inclusion";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import {
  findSimilarEvents,
  streamXatsiChat,
  toEventSummary,
  toProfileSummary,
  type ScoredEvent,
} from "@/lib/ai";
import type { Meetup, UserProfile } from "@/lib/types";
import type { Point } from "@/components/map/EventMap";

const PickMap = dynamic(() => import("@/components/map/EventMap").then((module) => module.EventMap), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
});

const LENGTHS = [
  { hours: 1, label: "1 hora" },
  { hours: 2, label: "2 horas" },
  { hours: 4, label: "4 horas" },
  { hours: 8, label: "Todo el día" },
] as const;

export interface EventFormValues {
  title: string;
  description: string;
  category: CategoryId;
  mode: "in_person" | "online";
  location: Point | null;
  placeName: string;
  onlineUrl: string | null;
  onlinePlatform: PlatformId | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number | null;
  inclusion: InclusionId[];
  official: boolean;
  image: File | null;
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold">{title}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {children}
    </fieldset>
  );
}

export function EventForm({
  canPublishOfficial = false,
  events,
  profile,
  onSubmit,
}: {
  /** True only for a verified institution; the security rules check it again on the server. */
  canPublishOfficial?: boolean;
  /** Upcoming events used for the similar-events check (F9). */
  events?: Meetup[];
  /** Profile used by xatsí to tailor similar event suggestions. */
  profile?: UserProfile | null;
  onSubmit: (values: EventFormValues) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [mode, setMode] = useState<"in_person" | "online">("in_person");
  const [location, setLocation] = useState<Point | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [platform, setPlatform] = useState<PlatformId>("meet");
  const [starts, setStarts] = useState("");
  const [hours, setHours] = useState(2);
  const [capacity, setCapacity] = useState("");
  const [inclusion, setInclusion] = useState<InclusionId[]>([]);
  const [official, setOfficial] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  // A temporary local link to show the chosen photo; freed when it changes or the form closes.
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  const [saving, setSaving] = useState(false);

  // ── F9: similar-events check & xatsí chatbot suggestion ─────────────────
  const [similar, setSimilar] = useState<ScoredEvent[]>([]);
  const [similarAiText, setSimilarAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const still = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!events?.length || !title.trim()) {
        setSimilar([]);
        setSimilarAiText("");
        return;
      }
      const text = [title, description, findCategory(category ?? "")?.label]
        .filter(Boolean)
        .join(" ");
      const results = await findSimilarEvents(text, events, 3);
      setSimilar(results);

      if (results.length > 0) {
        setSimilarAiText("");
        setLoadingAi(true);
        try {
          await streamXatsiChat(
            {
              prompt: `Quiero crear una actividad sobre: "${title}". ${
                description ? `Detalles: "${description}".` : ""
              }`,
              events: results.map(({ event }) => toEventSummary(event)),
              profile: profile ? toProfileSummary(profile) : null,
              mode: "similar",
            },
            (token) => setSimilarAiText((prev) => prev + token),
          );
        } finally {
          setLoadingAi(false);
        }
      } else {
        setSimilarAiText("");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [title, description, category, events, profile]);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!title.trim()) return toast.error("Ponle un título a la actividad.");
    if (!category) return toast.error("Elige un tema.");
    if (!starts) return toast.error("Elige el día y la hora.");
    const startsAt = new Date(starts);
    if (Number.isNaN(startsAt.getTime())) return toast.error("Esa fecha no es válida.");
    if (startsAt.getTime() < Date.now()) return toast.error("La fecha ya ha pasado. Elige otra.");
    if (mode === "in_person" && !location) return toast.error("Toca el mapa para marcar dónde es.");
    if (mode === "in_person" && !placeName.trim()) return toast.error("Escribe el nombre del sitio.");
    if (mode === "online" && !onlineUrl.trim()) return toast.error("Pega el enlace de la videollamada.");
    // Photos are shrunk before upload (src/lib/image.ts), so big phone photos are fine.
    if (image && image.size > 40 * 1024 * 1024) return toast.error("Esa imagen es demasiado grande.");

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        mode,
        location: mode === "in_person" ? location : null,
        placeName: mode === "in_person" ? placeName.trim() : "",
        onlineUrl: mode === "online" ? onlineUrl.trim() : null,
        onlinePlatform: mode === "online" ? platform : null,
        startsAt,
        endsAt: new Date(startsAt.getTime() + hours * 60 * 60 * 1000),
        capacity: capacity ? Number(capacity) : null,
        inclusion,
        official,
        image,
      });
    } catch (error) {
      console.error(error);
      toast.error("No se ha podido publicar. Inténtalo otra vez.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 p-4">
      <Question title="¿Qué vais a hacer?">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Por ejemplo: caminata al atardecer" aria-label="Título" required />
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Cuenta en pocas frases qué vais a hacer, para quién es y qué hay que llevar."
          aria-label="Descripción"
          rows={4}
        />
      </Question>

      <Question title="¿De qué tema es?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORIES.map((item) => (
            <Bubble
              key={item.id}
              icon={item.icon}
              label={item.label}
              description={item.description}
              pressed={category === item.id}
              onPressedChange={(on) => setCategory(on ? item.id : null)}
            />
          ))}
        </div>
      </Question>

      {/* ── F9: similar events warning & xatsí suggestion ─────────────────── */}
      {similar.length > 0 && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: still ? 0 : 0.3 }}
          className="space-y-3 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-4"
          aria-label="Actividades parecidas"
        >
          <div className="flex items-start gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BotMessageSquareIcon className="size-4" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold">xatsí te sugiere actividades parecidas</p>
              {similarAiText ? (
                <p className="text-sm text-foreground/90 leading-relaxed">{similarAiText}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {loadingAi
                    ? "xatsí está analizando las coincidencias…"
                    : "Ya existen actividades parecidas. ¿Quizás prefieras unirte a una de ellas para que se junte más gente?"}
                </p>
              )}
            </div>
          </div>
          <ul className="space-y-3">
            {similar.map(({ event }) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <Question title="¿En persona o en línea?">
        <div className="grid grid-cols-2 gap-2">
          <Bubble label="En persona" pressed={mode === "in_person"} onPressedChange={() => setMode("in_person")} />
          <Bubble label="En línea" pressed={mode === "online"} onPressedChange={() => setMode("online")} />
        </div>
      </Question>

      {mode === "in_person" ? (
        <Question title="¿Dónde es?" hint="Toca el mapa para marcar el sitio.">
          <PickMap pick={location} onPick={setLocation} className="h-64" />
          <Input
            value={placeName}
            onChange={(event) => setPlaceName(event.target.value)}
            placeholder="Nombre del sitio, por ejemplo: Parque García Sanabria"
            aria-label="Nombre del sitio"
          />
        </Question>
      ) : (
        <Question title="¿Dónde os conectáis?" hint="Elige la plataforma y pega el enlace. Solo lo verán las personas apuntadas.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLATFORMS.map((item) => (
              <Bubble key={item.id} label={item.label} pressed={platform === item.id} onPressedChange={() => setPlatform(item.id)} />
            ))}
          </div>
          <Input
            type="url"
            value={onlineUrl}
            onChange={(event) => setOnlineUrl(event.target.value)}
            placeholder="https://…"
            aria-label="Enlace de la videollamada"
          />
        </Question>
      )}

      <Question title="¿Cuándo?">
        <Input type="datetime-local" value={starts} onChange={(event) => setStarts(event.target.value)} aria-label="Día y hora" required />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {LENGTHS.map((option) => (
            <Bubble key={option.hours} label={option.label} pressed={hours === option.hours} onPressedChange={() => setHours(option.hours)} />
          ))}
        </div>
      </Question>

      <Question title="¿Cuánta gente cabe?" hint="Déjalo vacío si no hay límite.">
        <Input
          type="number"
          min={1}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          placeholder="Sin límite"
          aria-label="Número máximo de personas"
        />
      </Question>

      <Question title="¿Qué ofrece tu actividad?" hint="Marca solo lo que puedas cumplir. Ayuda a que más gente se anime.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {INCLUSION.map((item) => (
            <Bubble
              key={item.id}
              icon={item.icon}
              label={item.label}
              pressed={inclusion.includes(item.id)}
              onPressedChange={(on) =>
                setInclusion((current) => (on ? [...current, item.id] : current.filter((id) => id !== item.id)))
              }
            />
          ))}
        </div>
      </Question>

      <Question title="Una foto" hint="Opcional. Puedes usar una foto del móvil.">
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
          aria-label="Foto de la actividad"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa de la foto" className="h-40 w-full rounded-xl object-cover" />
        )}
      </Question>

      {canPublishOfficial && (
        <Question title="¿Es una actividad oficial?" hint="Llevará la insignia de tu institución.">
          <Bubble label="Sí, publícala como oficial" pressed={official} onPressedChange={setOfficial} className="sm:w-auto" />
        </Question>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving ? "Publicando…" : "Publicar actividad"}
      </Button>
    </form>
  );
}
