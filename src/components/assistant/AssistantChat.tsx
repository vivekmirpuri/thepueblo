"use client";
/**
 * xatsí, the assistant (F16) — Track C. Built (not a placeholder).
 *
 * Three states, and the empty one matters most: a screen with a bare text box tells you nothing,
 * so when there is nothing to show xatsí says what it can do and offers examples you can tap. The
 * examples are real sentences, not categories, so you learn you can just write what you feel like.
 *
 * Every answer is a compact list of real activities, the same rows as "Mis grupos". xatsí never writes an activity of its own, so it
 * cannot invent one. The AI text comes from a Cloudflare Worker that comments on the results the client already found.
 *
 * Presentational: it holds the text you are typing and reports it; the page does the searching
 * and the streaming.
 */
import { motion, useReducedMotion } from "motion/react";
import { BotMessageSquareIcon, SearchIcon, SparklesIcon, WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { AiDisclaimer } from "@/components/assistant/AiDisclaimer";
import { EventRow } from "@/components/shared/EventRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoredEvent } from "@/lib/ai";

const EXAMPLES = [
  "Algo al aire libre este fin de semana",
  "Para practicar español",
  "Un plan con niños",
  "Algo en línea esta semana",
];

export function AssistantChat({
  results,
  asked,
  busy,
  canSuggest,
  aiText,
  onAsk,
  onSuggest,
}: {
  /** null until the first question is asked. */
  results: ScoredEvent[] | null;
  /** What was asked, shown back so you can see what xatsí answered. */
  asked: string;
  busy: boolean;
  canSuggest: boolean;
  /** The AI-generated response, accumulated token by token from the Worker. */
  aiText: string;
  onAsk: (query: string) => void;
  onSuggest: () => void;
}) {
  const [query, setQuery] = useState("");
  const still = useReducedMotion();

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 p-4">
      <div className="flex-1">
        {busy ? (
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">Buscando…</span>
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : results === null ? (
          <section className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparklesIcon className="size-8" aria-hidden />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Habla con xatsí</h1>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                Dile qué te apetece hacer y te busca actividades cerca de ti. Escríbelo como lo
                dirías en voz alta.
              </p>
            </div>

            <ul className="w-full space-y-2 pt-2 text-left">
              {EXAMPLES.map((example) => (
                <li key={example}>
                  <Button
                    variant="outline"
                    className="h-auto min-h-11 w-full justify-start rounded-xl px-3 py-2.5 text-left whitespace-normal"
                    onClick={() => onAsk(example)}
                  >
                    <SearchIcon className="shrink-0 text-muted-foreground" aria-hidden />
                    {example}
                  </Button>
                </li>
              ))}
            </ul>

            {canSuggest && (
              <Button variant="secondary" size="lg" className="w-full" onClick={onSuggest}>
                <WandSparklesIcon aria-hidden /> Sugiéreme algo
              </Button>
            )}

            <AiDisclaimer />
          </section>
        ) : results.length === 0 ? (
          <section className="space-y-4 py-8">
            {aiText && (
              <motion.div
                initial={{ opacity: 0, y: still ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: still ? 0 : 0.25 }}
                className="flex gap-2.5 rounded-2xl bg-muted/60 p-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BotMessageSquareIcon className="size-4" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed">{aiText}</p>
              </motion.div>
            )}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">No he encontrado actividades exactas para «{asked}»</h2>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                Prueba con palabras como «música», «caminar» o «familias». O crea tú la actividad
                que te gustaría que existiera.
              </p>
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="text-sm text-muted-foreground">
              Esto es lo que he encontrado para «{asked}»
            </h2>
            {/* AI response bubble */}
            {aiText && (
              <motion.div
                initial={{ opacity: 0, y: still ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: still ? 0 : 0.25 }}
                className="flex gap-2.5 rounded-2xl bg-muted/60 p-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BotMessageSquareIcon className="size-4" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed">{aiText}</p>
              </motion.div>
            )}

            <AiDisclaimer />
            <ul className="divide-y rounded-xl border">
              {results.map(({ event }) => (
                <EventRow key={event.id} event={event} href={`/event/?id=${event.id}`} showFlags />
              ))}
            </ul>
          </section>
        )}
      </div>

      <form
        className="sticky bottom-20 flex gap-2 bg-background pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (query.trim()) onAsk(query.trim());
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="¿Qué te apetece hacer?"
          aria-label="Pregúntale a xatsí"
          className="h-11"
        />
        <Button type="submit" size="lg" disabled={busy || !query.trim()} aria-label="Buscar">
          <SearchIcon aria-hidden />
        </Button>
      </form>
    </div>
  );
}
