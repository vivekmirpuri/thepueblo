"use client";
/**
 * xatsí, the assistant chatbot (F16) — Track C. Built (not a placeholder).
 *
 * A conversation like a messaging app: your messages on the right, xatsí's on the left. xatsí
 * answers normal questions too, and when it suggests activities they appear under its message as
 * the same compact rows as "Mis grupos" — real activities only, it cannot invent one.
 *
 * The empty state matters most: a bare text box tells you nothing, so before the first message
 * xatsí says what it can do and offers example questions you can tap.
 *
 * Presentational: it holds the text you are typing; the page keeps the conversation and streams.
 */
import { useEffect, useRef, useState } from "react";
import { MessageCirclePlusIcon, SendHorizontalIcon, SparklesIcon, WandSparklesIcon } from "lucide-react";
import { AiDisclaimer } from "@/components/assistant/AiDisclaimer";
import { EventRow } from "@/components/shared/EventRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Meetup } from "@/lib/types";

export interface ChatEntry {
  role: "user" | "assistant";
  text: string;
  /** Activities xatsí suggested with this message. */
  events?: Meetup[];
}

const EXAMPLES = [
  "¿Cómo funciona FlejeThePueblo?",
  "Acabo de llegar a Tenerife, ¿qué me recomiendas?",
  "Algo al aire libre este fin de semana",
  "Planes en inglés para conocer gente",
];

function XatsiMark() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
      <SparklesIcon className="size-4" />
    </span>
  );
}

export function AssistantChat({
  entries,
  busy,
  canSuggest,
  onAsk,
  onSuggest,
  onReset,
}: {
  entries: ChatEntry[];
  busy: boolean;
  canSuggest: boolean;
  onAsk: (question: string) => void;
  onSuggest: () => void;
  onReset: () => void;
}) {
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const last = entries[entries.length - 1];

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [entries.length, last?.text, last?.events]);

  function send(event: React.FormEvent) {
    event.preventDefault();
    const question = text.trim();
    if (!question || busy) return;
    onAsk(question);
    setText("");
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 p-4">
      <div className="flex-1">
        {entries.length === 0 ? (
          <section className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparklesIcon className="size-8" aria-hidden />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Habla con xatsí</h1>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                Pregúntale lo que quieras sobre la app o las islas, o dile qué te apetece hacer y te
                propone actividades reales.
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
                    <SparklesIcon className="shrink-0 text-muted-foreground" aria-hidden />
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
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <AiDisclaimer />
              <Button variant="ghost" size="sm" className="h-11 shrink-0" onClick={onReset} disabled={busy}>
                <MessageCirclePlusIcon aria-hidden /> Nueva
              </Button>
            </div>

            <ol className="space-y-4" aria-label="Conversación con xatsí" aria-live="polite">
              {entries.map((entry, index) =>
                entry.role === "user" ? (
                  <li key={index} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm whitespace-pre-line break-words text-primary-foreground">
                      {entry.text}
                    </p>
                  </li>
                ) : (
                  <li key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <XatsiMark />
                      <p
                        className={cn(
                          "max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-relaxed whitespace-pre-line break-words",
                          !entry.text && "text-muted-foreground",
                        )}
                      >
                        {entry.text || "xatsí está escribiendo…"}
                      </p>
                    </div>
                    {entry.events && entry.events.length > 0 && (
                      <ul className="ml-10 divide-y rounded-xl border" aria-label="Actividades que propone xatsí">
                        {entry.events.map((event) => (
                          <EventRow key={event.id} event={event} href={`/event/?id=${event.id}`} showFlags />
                        ))}
                      </ul>
                    )}
                  </li>
                ),
              )}
            </ol>
          </section>
        )}
        <div ref={end} />
      </div>

      <form onSubmit={send} className="sticky bottom-20 flex gap-2 bg-background pt-2">
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe a xatsí"
          aria-label="Mensaje para xatsí"
          maxLength={1000}
          className="h-11"
        />
        <Button type="submit" size="lg" className="h-11" disabled={busy || !text.trim()} aria-label="Enviar">
          <SendHorizontalIcon aria-hidden />
        </Button>
      </form>
    </div>
  );
}
