"use client";
/**
 * The profile questions — Track C. Built (not a placeholder).
 *
 * One set of questions, shown two ways:
 *  - `mode="wizard"` (first time, /onboarding/): one question per screen, with a progress bar,
 *    a way back and a way to skip anything optional. Short screens are easier for everyone and
 *    much easier for someone reading slowly or on a small phone.
 *  - `mode="single"` (editing, /profile/): every question on one scrollable page, because then
 *    you are usually changing one thing and want to find it fast.
 *
 * Required: name, at least one language, and an island. Everything else can stay empty, including
 * pronouns — they are offered, never demanded.
 *
 * Presentational: it holds only the draft while you type. Saving is the page's job (`onSubmit`).
 */
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeftIcon } from "lucide-react";
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

export function ProfileForm({
  initial,
  submitLabel,
  onSubmit,
  mode = "single",
}: {
  initial?: Partial<ProfileDraft>;
  submitLabel: string;
  onSubmit: (draft: ProfileDraft) => Promise<void>;
  mode?: "wizard" | "single";
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
  const [step, setStep] = useState(0);
  const [forwards, setForwards] = useState(true);
  const [saving, setSaving] = useState(false);
  const still = useReducedMotion();

  const change = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  /** `missing` is the message shown if you try to move on without answering. */
  const questions = [
    {
      id: "name",
      title: "¿Cómo te llamas?",
      hint: "Puedes poner solo tu nombre.",
      missing: draft.displayName.trim() ? null : "Escribe tu nombre.",
      content: (
        <Input
          value={draft.displayName}
          onChange={(event) => change({ displayName: event.target.value })}
          placeholder="Tu nombre"
          autoComplete="name"
          aria-label="Tu nombre"
          autoFocus={mode === "wizard"}
        />
      ),
    },
    {
      id: "pronouns",
      title: "Tus pronombres",
      hint: "Es opcional. Se verán junto a tu nombre.",
      optional: true,
      missing: null,
      content: (
        <div className="space-y-3">
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
        </div>
      ),
    },
    {
      id: "languages",
      title: "¿Qué idiomas hablas?",
      hint: "Elige todos los que hables. Así sabrás con quién te vas a entender.",
      missing: draft.languages.length ? null : "Elige al menos un idioma que hables.",
      content: (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((language) => (
            <Bubble
              key={language.code}
              icon={language.flag}
              label={language.label}
              description={language.name !== language.label ? language.name : undefined}
              pressed={draft.languages.includes(language.code)}
              onPressedChange={() => change({ languages: flip(draft.languages, language.code) as LanguageCode[] })}
            />
          ))}
        </div>
      ),
    },
    {
      id: "interests",
      title: "¿Qué te gustaría hacer?",
      hint: "Elige los temas que te interesan. Te enseñaremos actividades de estos temas.",
      optional: true,
      missing: null,
      content: (
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
      ),
    },
    {
      id: "island",
      title: "¿En qué isla vives?",
      hint: "Solo guardamos la isla, nunca dónde estás exactamente.",
      missing: draft.island ? null : "Elige tu isla.",
      content: (
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
      ),
    },
    {
      id: "when",
      title: "¿Cómo y cuándo quedas?",
      hint: "Nos ayuda a enseñarte planes a los que puedas ir.",
      optional: true,
      missing: null,
      content: (
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Prefiero quedar</h3>
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
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Suelo tener tiempo</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {AVAILABILITY.map((option) => (
                <Bubble
                  key={option.id}
                  label={option.label}
                  pressed={draft.availability.includes(option.id)}
                  onPressedChange={() =>
                    change({ availability: flip(draft.availability as AvailabilityId[], option.id) })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "about",
      title: "Cuéntanos algo de ti",
      hint: "Una o dos frases. Lo verán las personas que miren tu perfil.",
      optional: true,
      missing: null,
      content: (
        <div className="space-y-5">
          <Textarea
            value={draft.bio}
            onChange={(event) => change({ bio: event.target.value })}
            placeholder="Por ejemplo: acabo de llegar a Tenerife y me gustaría conocer gente para caminar."
            aria-label="Algo sobre ti"
            rows={3}
          />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">¿Representas a una institución?</h3>
            <p className="text-sm text-muted-foreground">
              Ayuntamientos, cabildos, asociaciones y centros culturales. Comprobaremos quién eres
              antes de que puedas publicar actividades oficiales.
            </p>
            <Bubble
              label="Sí, represento a una institución"
              pressed={draft.role === "institution"}
              onPressedChange={(on) => change({ role: on ? "institution" : "user" })}
              className="sm:w-auto"
            />
          </div>
        </div>
      ),
    },
  ];

  async function save() {
    const unanswered = questions.find((question) => question.missing);
    if (unanswered) {
      setStep(questions.indexOf(unanswered));
      return toast.error(unanswered.missing!);
    }
    setSaving(true);
    try {
      await onSubmit({
        ...draft,
        island: draft.island as IslandId,
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

  // ── Editing: every question on one page ────────────────────────────────────
  if (mode !== "wizard") {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
        className="space-y-8 p-4"
      >
        {questions.map((question) => (
          <fieldset key={question.id} className="space-y-3">
            <legend className="text-base font-semibold">{question.title}</legend>
            {question.hint && <p className="text-sm text-muted-foreground">{question.hint}</p>}
            {question.content}
          </fieldset>
        ))}
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? "Guardando…" : submitLabel}
        </Button>
      </form>
    );
  }

  // ── First time: one question per screen ────────────────────────────────────
  const current = questions[step];
  const last = step === questions.length - 1;

  function go(to: number) {
    setForwards(to > step);
    setStep(Math.min(Math.max(to, 0), questions.length - 1));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (current.missing) return toast.error(current.missing);
        if (last) void save();
        else go(step + 1);
      }}
      className="flex min-h-[70vh] flex-col gap-6 p-4"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            aria-label="Volver a la pregunta anterior"
          >
            <ArrowLeftIcon aria-hidden />
          </Button>
          <p className="text-sm text-muted-foreground">
            Paso {step + 1} de {questions.length}
          </p>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={step + 1}
          aria-label="Progreso del registro"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
            transition={{ duration: still ? 0 : 0.25, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.fieldset
          key={current.id}
          className="flex-1 space-y-3"
          initial={{ opacity: 0, x: still ? 0 : forwards ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: still ? 0 : forwards ? -16 : 16 }}
          transition={{ duration: still ? 0 : 0.2, ease: "easeOut" }}
        >
          <legend className="text-xl font-semibold">{current.title}</legend>
          {current.hint && <p className="text-sm text-muted-foreground">{current.hint}</p>}
          <div className="pt-1">{current.content}</div>
        </motion.fieldset>
      </AnimatePresence>

      <div className="sticky bottom-20 space-y-2 bg-background pt-2">
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? "Guardando…" : last ? submitLabel : "Siguiente"}
        </Button>
        {current.optional && !last && (
          <Button type="button" variant="ghost" className="w-full" onClick={() => go(step + 1)}>
            Saltar esta pregunta
          </Button>
        )}
      </div>
    </form>
  );
}
