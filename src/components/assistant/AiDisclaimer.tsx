"use client";
/**
 * What xatsí is and is not — Track C. Built (not a placeholder).
 *
 * People have the right to know when they are dealing with an automatic system rather than a
 * person (EU AI Act, transparency duties). So xatsí always shows a short line, and a tap opens the
 * full explanation in lectura fácil.
 *
 * Keep this text TRUE. Today: activities are ranked in the browser (by words); then the last
 * turns of the conversation, a numbered list of real activities and, if signed in, interests,
 * languages and island (never the name) go to the xatsí Worker (Cloudflare Workers AI, Llama 3.2
 * 3B), which replies and cites activities from that list (src/lib/ai/cloudflare.ts). Change this
 * text whenever that changes.
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
  ["Qué se envía", "Para responderte, xatsí envía tus últimos mensajes de esta conversación y una lista de actividades de la app a un servicio de inteligencia artificial (Cloudflare Workers AI). Si has entrado en tu cuenta, también tus intereses, tus idiomas y tu isla. Tu nombre no se envía. FlejeThePueblo no guarda la conversación: al salir de la pantalla se borra."],
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
              Primero tu móvil elige entre las actividades de la app las que más se parecen a lo que
              escribes. Después un modelo de inteligencia artificial (Llama 3.2) te responde y, si
              quieres planes, escoge actividades de esa lista. Si ese servicio no responde, verás un
              aviso y las actividades que coinciden con tus palabras.
            </dd>
          </div>
        </dl>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
