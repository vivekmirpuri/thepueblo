"use client";
/**
 * What xatsí is and is not — Track C. Built (not a placeholder).
 *
 * People have the right to know when they are dealing with an automatic system rather than a
 * person (EU AI Act, transparency duties). So xatsí always shows a short line, and a tap opens the
 * full explanation in lectura fácil.
 *
 * Keep this text TRUE: today xatsí finds activities by matching words, on the device. When the
 * language model (C3/C6) is switched on, update "Cómo funciona" to say so.
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
  ["Funciona en tu móvil", "Busca dentro de tu dispositivo. Lo que escribes a xatsí no se envía ni se guarda."],
  ["Solo enseña actividades reales", "Todo lo que te propone son actividades publicadas en la app. No se inventa planes."],
  ["Puede equivocarse", "Antes de ir, mira la fecha, el lugar y la accesibilidad en la página de la actividad."],
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
          xatsí es un asistente automático y puede equivocarse. <span className="underline">Saber más</span>
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
              Hoy compara las palabras que escribes con las de cada actividad. Más adelante usará un
              pequeño modelo de inteligencia artificial que también funcionará en tu móvil.
            </dd>
          </div>
        </dl>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
