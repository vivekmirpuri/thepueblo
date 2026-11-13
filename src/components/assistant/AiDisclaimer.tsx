"use client";
/**
 * What xatsí is and is not — Track C. Built (not a placeholder).
 *
 * People have the right to know when they are dealing with an automatic system rather than a
 * person (EU AI Act, transparency duties). So xatsí always shows a short line, and a tap opens the
 * full explanation in lectura fácil.
 *
 * Keep this text TRUE. Today: the search runs in the browser (by words); then the question, a
 * summary of the activities found and, if signed in, name, interests, languages and island are
 * sent to the xatsí Worker (Cloudflare Workers AI, Llama 3.2 3B) to write a short reply
 * (src/lib/ai/cloudflare.ts). Change this text whenever that changes.
 */
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const POINTS = [
  ["Es automático, no una persona", "xatsí es un programa. Nadie lee lo que escribes ni te contesta a mano."],
  ["Qué se envía", "Para escribirte la respuesta, xatsí envía tu pregunta y un resumen de las actividades encontradas a un servicio de inteligencia artificial (Cloudflare Workers AI). Si has entrado en tu cuenta, también tu nombre, tus intereses, tus idiomas y tu isla. FlejeThePueblo no guarda tus preguntas."],
  ["No escribas datos personales", "No pongas en tus preguntas datos de salud, documentos, direcciones ni nada que no quieras compartir."],
  ["Las tarjetas son reales", "Las actividades que ves en tarjetas están publicadas en la app. El texto que las acompaña lo escribe una inteligencia artificial."],
  ["Puede equivocarse", "El texto puede tener errores. Antes de ir, mira la fecha, el lugar y la accesibilidad en la página de la actividad."],
  ["No decide por ti", "Te sugiere opciones. Apuntarte o no siempre lo decides tú."],
  ["No es para urgencias", "Para emergencias llama al 112. Para salud o temas legales, habla con profesionales."],
] as const;

export function AiDisclaimer() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" className="h-auto min-h-11 gap-1.5 px-2 py-1 text-xs font-normal whitespace-normal text-muted-foreground" />
        }
      >
        <InfoIcon className="size-4 shrink-0" aria-hidden />
        <span>
          xatsí usa inteligencia artificial y puede equivocarse. <span className="underline">Saber más</span>
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sobre xatsí</DialogTitle>
          <DialogDescription>Qué es, qué hace con lo que escribes y qué no puede hacer.</DialogDescription>
        </DialogHeader>
        <dl className="space-y-3 text-sm">
          {POINTS.map(([title, text]) => (
            <div key={title}>
              <dt className="font-semibold">{title}</dt>
              <dd className="text-muted-foreground">{text}</dd>
            </div>
          ))}
          <div>
            <dt className="font-semibold">Cómo funciona</dt>
            <dd className="text-muted-foreground">
              Primero busca en tu móvil las actividades cuyas palabras coinciden con lo que escribes.
              Después un modelo de inteligencia artificial (Llama 3.2) escribe dos o tres frases sobre
              lo que ha encontrado. Si ese servicio no responde, verás una frase fija.
            </dd>
          </div>
        </dl>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
