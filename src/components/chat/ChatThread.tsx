"use client";
/**
 * The group chat of one activity (F14) — Track B. Built (not a placeholder).
 *
 * Like a WhatsApp group: my messages on the right in the brand colour, everyone else's on the left
 * with their name and pronouns, newest at the bottom. It scrolls itself to the last message.
 * When nobody has written yet it says so and invites you to say hello, instead of an empty box.
 *
 * Presentational: messages come in as props and new ones go out through `onSend`; the page
 * subscribes to Firestore and unsubscribes when it closes.
 */
import { useEffect, useRef, useState } from "react";
import { SendHorizontalIcon } from "lucide-react";
import { PersonName } from "@/components/shared/PersonName";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MESSAGE_MAX } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

const TIME = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });

export function ChatThread({
  messages,
  myUid,
  onSend,
}: {
  messages: ChatMessage[];
  myUid: string;
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    try {
      await onSend(clean);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no ha escrito nadie. Saluda al grupo y preséntate.
        </p>
      ) : (
        <ol className="space-y-2" aria-label="Mensajes del grupo" aria-live="polite">
          {messages.map((message, index) => {
            const mine = message.uid === myUid;
            // Show the name only when the sender changes, like in a messaging app.
            const first = index === 0 || messages[index - 1].uid !== message.uid;
            return (
              <li key={message.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                {!mine && first && (
                  <span className="px-1 pb-0.5 text-xs font-medium">
                    <PersonName name={message.name} pronouns={message.pronouns} />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line break-words",
                    mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted",
                  )}
                >
                  {message.text}
                </div>
                {message.createdAt && (
                  <time className="px-1 pt-0.5 text-[11px] text-muted-foreground">
                    {TIME.format(message.createdAt.toDate())}
                  </time>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <div ref={end} />

      <form onSubmit={send} className="sticky bottom-20 flex gap-2 bg-background pt-2">
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe un mensaje"
          aria-label="Mensaje para el grupo"
          maxLength={MESSAGE_MAX}
          className="h-11"
        />
        <Button type="submit" size="lg" disabled={sending || !text.trim()} aria-label="Enviar">
          <SendHorizontalIcon aria-hidden />
        </Button>
      </form>
    </div>
  );
}
