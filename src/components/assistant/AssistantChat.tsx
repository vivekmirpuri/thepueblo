"use client";
/**
 * xatsí, the assistant (F16) — Track C. Built (not a placeholder).
 *
 * Three states, and the empty one matters most: a screen with a bare text box tells you nothing,
 * so when there is nothing to show xatsí says what it can do and offers examples you can tap. The
 * examples are real sentences, not categories, so you learn you can just write what you feel like.
 *
 * Every answer is a compact list of real activities, the same rows as "Mis grupos". xatsí never writes an activity of its own, so it
 * cannot invent one.
 *
 * Presentational: it holds the text you are typing and reports it; the page does the searching.
 */
import { SearchIcon, SparklesIcon, WandSparklesIcon } from "lucide-react";
import { useState } from "react";
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
  onAsk,
  onSuggest,
}: {
  /** null until the first question is asked. */
  results: ScoredEvent[] | null;
  /** What was asked, shown back so you can see what xatsí answered. */
  asked: string;
  busy: boolean;
  canSuggest: boolean;
  onAsk: (query: string) => void;
  onSuggest: () => void;
}) {
  const [query, setQuery] = useState("");

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

            <p className="max-w-xs text-xs text-muted-foreground">
              xatsí funciona dentro de tu móvil. Lo que escribes no sale de aquí.
            </p>
          </section>
        ) : results.length === 0 ? (
          <section className="space-y-3 py-10 text-center">
            <h2 className="text-lg font-semibold">No he encontrado nada para «{asked}»</h2>
            <p className="mx-auto max-w-xs text-sm text-muted-foreground">
              Prueba con menos palabras, por ejemplo «música» o «caminar». O crea tú la actividad
              que te gustaría que existiera.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="text-sm text-muted-foreground">
              Esto es lo que he encontrado para «{asked}»
            </h2>
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
