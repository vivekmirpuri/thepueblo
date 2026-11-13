"use client";
/**
 * Gente como tú (F15) — Track C. Built (not a placeholder).
 * Pattern: this page is the CONTAINER (loads the profiles and ranks them with matchPeople);
 * <ProfileCard> only draws.
 *
 * Signed-in only, like the profiles themselves (firestore.rules). The point is to see who you
 * would get on with before you meet, so the cards lead with what you share. Filters narrow the
 * list to people who speak your language or live on your island.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { ProfileCard } from "@/components/people/ProfileCard";
import { Bubble } from "@/components/shared/Bubble";
import { RequireUser } from "@/components/shared/RequireUser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listProfiles } from "@/lib/db";
import { matchPeople } from "@/lib/people";
import type { UserProfile } from "@/lib/types";

function People({ me }: { me: UserProfile }) {
  const [people, setPeople] = useState<UserProfile[] | null>(null);
  const [sameLanguage, setSameLanguage] = useState(false);
  const [sameIsland, setSameIsland] = useState(false);

  useEffect(() => {
    listProfiles()
      .then(setPeople)
      .catch(() => {
        toast.error("No se han podido cargar los perfiles.");
        setPeople([]);
      });
  }, []);

  const matches = useMemo(
    () =>
      people
        ? matchPeople(me, people)
            .filter((match) => !sameLanguage || match.languages.length > 0)
            .filter((match) => !sameIsland || match.sameIsland)
            .slice(0, 30)
        : null,
    [people, me, sameLanguage, sameIsland],
  );

  return (
    <div className="space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Gente como tú</h1>
        <p className="text-sm text-muted-foreground">
          Personas con tus intereses o tus idiomas. Primero, quienes más cosas comparten contigo.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Bubble label="Hablan mi idioma" pressed={sameLanguage} onPressedChange={setSameLanguage} />
        <Bubble label="De mi isla" pressed={sameIsland} onPressedChange={setSameIsland} />
      </div>

      {matches === null ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Cargando…</span>
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : matches.length === 0 ? (
        <section className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UsersIcon className="size-7" aria-hidden />
          </span>
          <h2 className="font-semibold">Todavía no hay nadie con estos filtros</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Prueba a quitar un filtro, o añade más intereses e idiomas a tu perfil.
          </p>
          <Button nativeButton={false} render={<Link href="/profile/" />} variant="outline">
            Editar mi perfil
          </Button>
        </section>
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.profile.uid}>
              <ProfileCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PeoplePage() {
  return <RequireUser>{({ profile }) => (profile ? <People me={profile} /> : null)}</RequireUser>;
}
