"use client";
/**
 * The profile questions — Track C. Built (not a placeholder).
 *
 * One form used twice: by /onboarding/ the first time and by /profile/ when editing. Every
 * multiple-choice question is a grid of <Bubble>s, so the whole thing is tappable on a phone and
 * each option can explain itself in one line (lectura fácil).
 *
 * Required: name, at least one language, and an island. Everything else can stay empty, including
 * pronouns — they are offered, never demanded.
 *
 * Presentational: it holds only the draft while you type. Saving is the page's job (`onSubmit`).
 */
import { useState } from "react";
import { toast } from "sonner";
import { Bubble } from "@/components/shared/Bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { PRONOUN_SUGGESTIONS } from "@/lib/inclusion";
import { ISLANDS, type IslandId } from "@/lib/islands";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";
import { AVAILABILITY, PREFERS, type AvailabilityId } from "@/lib/profile";
import type { ProfileDraft } from "@/lib/types";

/** The island is empty until the person picks one; `onSubmit` only ever receives a real one. */
type Draft = Omit<ProfileDraft, "island"> & { island: IslandId | "" };

const flip = <T,>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold">{title}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {children}
    </fieldset>
  );
}

export function ProfileForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ProfileDraft>;
  submitLabel: string;
  onSubmit: (draft: ProfileDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>({
    displayName: initial?.displayName ?? "",
    pronouns: initial?.pronouns ?? null,
    photoURL: initial?.photoURL ?? null,
    role: initial?.role ?? "user",
    bio: initial?.bio ?? "",
    interests: initial?.interests ?? [],
    languages: initial?.languages ?? [],
    island: initial?.island ?? "",
    prefers: initial?.prefers ?? "both",
    availability: initial?.availability ?? [],
  });
  const [saving, setSaving] = useState(false);

  const change = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.displayName.trim()) return toast.error("Escribe tu nombre.");
    if (draft.languages.length === 0) return toast.error("Elige al menos un idioma que hables.");
    if (!draft.island) return toast.error("Elige tu isla.");

    setSaving(true);
    try {
      await onSubmit({
        ...draft,
        island: draft.island,
        displayName: draft.displayName.trim(),
        pronouns: draft.pronouns?.trim() || null,
        bio: draft.bio.trim(),
      });
    } catch (error) {
      console.error(error);
      toast.error("No se ha podido guardar. Inténtalo otra vez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 p-4">
      <Question title="¿Cómo te llamas?">
        <Input
          value={draft.displayName}
          onChange={(event) => change({ displayName: event.target.value })}
          placeholder="Tu nombre"
          autoComplete="name"
          aria-label="Tu nombre"
          required
        />
      </Question>

      <Question title="Tus pronombres" hint="Es opcional. Se verán junto a tu nombre.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRONOUN_SUGGESTIONS.map((option) => (
            <Bubble
              key={option}
              label={option}
              pressed={draft.pronouns === option}
              onPressedChange={(on) => change({ pronouns: on ? option : null })}
            />
          ))}
        </div>
        <Input
          value={draft.pronouns ?? ""}
          onChange={(event) => change({ pronouns: event.target.value || null })}
          placeholder="U otros, escríbelos aquí"
          aria-label="Otros pronombres"
        />
      </Question>

      <Question title="¿Qué idiomas hablas?" hint="Elige todos los que hables. Así sabrás con quién te vas a entender.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((language) => (
            <Bubble
              key={language.code}
              icon={language.flag}
              label={language.label}
              pressed={draft.languages.includes(language.code)}
              onPressedChange={() => change({ languages: flip(draft.languages, language.code) as LanguageCode[] })}
            />
          ))}
        </div>
      </Question>

      <Question title="¿Qué te gustaría hacer?" hint="Elige los temas que te interesan. Te enseñaremos encuentros de estos temas.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Bubble
              key={category.id}
              icon={category.icon}
              label={category.label}
              description={category.description}
              pressed={draft.interests.includes(category.id)}
              onPressedChange={() => change({ interests: flip(draft.interests, category.id) as CategoryId[] })}
            />
          ))}
        </div>
      </Question>

      <Question title="¿En qué isla vives?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ISLANDS.map((island) => (
            <Bubble
              key={island.id}
              label={island.name}
              pressed={draft.island === island.id}
              onPressedChange={(on) => change({ island: on ? island.id : "" })}
            />
          ))}
        </div>
      </Question>

      <Question title="¿Cómo prefieres quedar?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PREFERS.map((option) => (
            <Bubble
              key={option.id}
              label={option.label}
              pressed={draft.prefers === option.id}
              onPressedChange={() => change({ prefers: option.id })}
            />
          ))}
        </div>
      </Question>

      <Question title="¿Cuándo sueles tener tiempo?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {AVAILABILITY.map((option) => (
            <Bubble
              key={option.id}
              label={option.label}
              pressed={draft.availability.includes(option.id)}
              onPressedChange={() => change({ availability: flip(draft.availability as AvailabilityId[], option.id) })}
            />
          ))}
        </div>
      </Question>

      <Question title="Cuéntanos algo de ti" hint="Una o dos frases. Lo verán las personas que miren tu perfil.">
        <Textarea
          value={draft.bio}
          onChange={(event) => change({ bio: event.target.value })}
          placeholder="Por ejemplo: acabo de llegar a Tenerife y me gustaría conocer gente para caminar."
          aria-label="Algo sobre ti"
          rows={3}
        />
      </Question>

      <Question title="¿Representas a una institución?" hint="Ayuntamientos, cabildos, asociaciones y centros culturales. Comprobaremos quién eres antes de que puedas publicar actividades oficiales.">
        <Bubble
          label="Sí, represento a una institución"
          pressed={draft.role === "institution"}
          onPressedChange={(on) => change({ role: on ? "institution" : "user" })}
          className="sm:w-auto"
        />
      </Question>

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving ? "Guardando…" : submitLabel}
      </Button>
    </form>
  );
}
