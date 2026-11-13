"use client";
/**
 * Reviews of one activity: the average, every review, and my own (F12) — Track B. Built.
 *
 * Only people who joined can review, and only once the activity has started (firestore.rules
 * check both). Before that, attendees see when they will be able to; everyone else just reads.
 * Stars are shown with a number next to them, so the rating does not depend on seeing the icons.
 *
 * Presentational: reviews come in as props and mine goes out through `onSave`.
 */
import { profileHref } from "@/lib/people";
import Link from "next/link";
import { useState } from "react";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";
import { PersonName } from "@/components/shared/PersonName";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_MAX } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

const DAY = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
const ONE_DECIMAL = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={cn("size-4", star <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}

function ReviewForm({ mine, onSave }: { mine?: Review; onSave: (rating: number, text: string) => Promise<void> }) {
  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [text, setText] = useState(mine?.text ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rating) return toast.error("Elige de 1 a 5 estrellas.");
    setSaving(true);
    try {
      await onSave(rating, text.trim());
      toast.success(mine ? "Reseña cambiada." : "Gracias por tu reseña.");
    } catch {
      toast.error("No se ha podido guardar. Inténtalo otra vez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border p-3">
      <h3 className="text-sm font-semibold">{mine ? "Tu reseña" : "¿Qué tal fue?"}</h3>
      <div role="radiogroup" aria-label="Tu valoración" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} de 5 estrellas`}
            onClick={() => setRating(star)}
            className="flex size-11 items-center justify-center rounded-lg outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <StarIcon className={cn("size-7", star <= rating ? "fill-primary text-primary" : "text-muted-foreground/50")} aria-hidden />
          </button>
        ))}
      </div>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Cuenta qué te pareció, si quieres. Ayuda a otras personas a decidir."
        aria-label="Comentario"
        maxLength={REVIEW_MAX}
        rows={3}
      />
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando…" : mine ? "Cambiar mi reseña" : "Publicar reseña"}
      </Button>
    </form>
  );
}

export function Reviews({
  reviews,
  myUid,
  canReview,
  waitingToStart,
  onSave,
}: {
  reviews: Review[] | null;
  myUid?: string;
  /** I joined and the activity has started. */
  canReview: boolean;
  /** I joined but it has not started yet. */
  waitingToStart: boolean;
  onSave: (rating: number, text: string) => Promise<void>;
}) {
  const mine = reviews?.find((review) => review.uid === myUid);
  const average = reviews?.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <section className="space-y-3">
      <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold">
        Reseñas
        {reviews && reviews.length > 0 && (
          <span className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
            <Stars value={average} />
            {ONE_DECIMAL.format(average)} de 5 · {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
          </span>
        )}
      </h2>

      {canReview && <ReviewForm key={mine?.rating ?? "new"} mine={mine} onSave={onSave} />}
      {waitingToStart && (
        <p className="text-sm text-muted-foreground">Podrás dejar tu reseña cuando empiece la actividad.</p>
      )}

      {reviews === null ? null : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay reseñas.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.uid} className="space-y-1 rounded-xl bg-muted/50 p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link href={profileHref(review.uid)} className="font-medium rounded-sm underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                  <PersonName name={review.name} />
                </Link>
                <Stars value={review.rating} />
                <span className="sr-only">{review.rating} de 5 estrellas</span>
                {review.createdAt && (
                  <span className="text-xs text-muted-foreground">{DAY.format(review.createdAt.toDate())}</span>
                )}
              </div>
              {review.text && <p className="text-sm whitespace-pre-line">{review.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
