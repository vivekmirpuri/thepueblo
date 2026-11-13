"use client";
/**
 * A profile (F2) — Built (not a placeholder).
 *
 *  - /profile/            → mine: see it, edit it, sign out.
 *  - /profile/?uid=<uid>  → someone else's, read-only: what we have in common, and the upcoming
 *                           activities they are going to, so you can join one and meet them.
 *
 * Pattern: this page is the CONTAINER (loads the other person's profile and activities, saves my
 * edits, signs out); <ProfileForm> draws the edit form. Signed-in only, like profiles in the rules.
 * The uid is read with useSearchParams() inside a <Suspense> (static export, no /profile/[uid]).
 */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { signOut } from "firebase/auth";
import { BadgeCheckIcon, LogOutIcon, MapPinIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { ProfileForm } from "@/components/people/ProfileForm";
import { EventRow } from "@/components/shared/EventRow";
import { Flag } from "@/components/shared/LanguageFlags";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { PersonName } from "@/components/shared/PersonName";
import { RequireUser } from "@/components/shared/RequireUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/auth";
import { findCategory } from "@/lib/categories";
import { getProfile, listMyEvents, saveProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { homeName } from "@/lib/islands";
import { LANGUAGES } from "@/lib/languages";
import { matchPeople } from "@/lib/people";
import { AVAILABILITY, PREFERS } from "@/lib/profile";
import type { Meetup, UserProfile } from "@/lib/types";

function LanguageBadges({ codes, highlight = [] }: { codes: string[]; highlight?: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {codes.map((code) => {
        const language = LANGUAGES.find((item) => item.code === code);
        return (
          <li key={code}>
            <Badge variant={highlight.includes(code) ? "secondary" : "outline"}>
              <Flag flag={language?.flag} /> {language?.name ?? code}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

function InterestBadges({ ids, highlight = [] }: { ids: string[]; highlight?: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const category = findCategory(id);
        if (!category) return null;
        const Icon = category.icon;
        return (
          <li key={id}>
            <Badge variant={highlight.includes(id) ? "secondary" : "outline"}>
              <Icon className="size-3.5" aria-hidden /> {category.label}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

/** Everything a profile shows; `mine` switches the wording and `children` holds what goes below. */
function ProfileView({ profile, mine, shared, children }: {
  profile: UserProfile;
  mine: boolean;
  shared?: { languages: string[]; interests: string[] };
  children?: ReactNode;
}) {
  const island = homeName(profile.island);
  const prefers = PREFERS.find((item) => item.id === profile.prefers);
  const languages = profile.languages ?? [];
  const interests = profile.interests ?? [];
  const availability = profile.availability ?? [];

  return (
    <div className="space-y-6 p-4">
      <header className="flex items-center gap-4">
        <PersonAvatar name={profile.displayName} avatar={profile.avatar} className="size-20 text-xl" />
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-xl font-semibold">
            <PersonName name={profile.displayName} pronouns={profile.pronouns} />
          </h1>
          {island && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-4" aria-hidden />
              {island}
            </p>
          )}
          {profile.role === "institution" && (
            <Badge variant={profile.verified ? "default" : "secondary"}>
              {profile.verified && <BadgeCheckIcon className="size-3.5" aria-hidden />}
              {profile.verified ? "Institución verificada" : "Institución sin verificar"}
            </Badge>
          )}
        </div>
      </header>

      {profile.bio && <p className="text-sm">{profile.bio}</p>}

      {shared && (shared.languages.length > 0 || shared.interests.length > 0) && (
        <p className="rounded-xl bg-primary/10 p-3 text-sm">
          Tenéis en común {[shared.languages.length && `${shared.languages.length} ${shared.languages.length === 1 ? "idioma" : "idiomas"}`, shared.interests.length && `${shared.interests.length} ${shared.interests.length === 1 ? "interés" : "intereses"}`].filter(Boolean).join(" y ")}. Los verás resaltados.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{mine ? "Idiomas que hablo" : "Idiomas que habla"}</h2>
        <LanguageBadges codes={languages} highlight={shared?.languages} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{mine ? "Me interesa" : "Le interesa"}</h2>
        {interests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{mine ? "Todavía no has elegido temas." : "Todavía no ha elegido temas."}</p>
        ) : (
          <InterestBadges ids={interests} highlight={shared?.interests} />
        )}
      </section>

      <section className="space-y-1 text-sm text-muted-foreground">
        <h2 className="text-sm font-semibold text-foreground">{mine ? "Cómo quedo" : "Cómo queda"}</h2>
        <p>{prefers?.label}</p>
        {availability.length > 0 && (
          <p>{availability.map((id) => AVAILABILITY.find((item) => item.id === id)?.label ?? id).join(" · ")}</p>
        )}
      </section>

      {children}
    </div>
  );
}

function OtherProfile({ uid, me }: { uid: string; me: UserProfile }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [looked, setLooked] = useState(false);
  const [events, setEvents] = useState<Meetup[] | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    getProfile(uid)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLooked(true));
    listMyEvents(uid)
      .then((list) => setEvents(list.filter((event) => event.endsAt.toMillis() >= now)))
      .catch(() => setEvents([]));
  }, [uid, now]);

  if (!looked) {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <span className="sr-only">Cargando…</span>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (!profile) return <p className="p-8 text-center text-sm text-muted-foreground">No encontramos este perfil.</p>;

  const match = matchPeople(me, [profile])[0];
  return (
    <ProfileView profile={profile} mine={false} shared={match ? { languages: match.languages, interests: match.interests } : undefined}>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Sus próximas actividades</h2>
        {events === null ? (
          <Skeleton className="h-16 w-full" />
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ahora mismo no se ha apuntado a ninguna actividad.</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Apúntate a una y os conocéis allí.</p>
            <ul className="divide-y rounded-xl border">
              {events.slice(0, 6).map((event) => (
                <EventRow key={event.id} event={event} href={`/event/?id=${event.id}`} showFlags />
              ))}
            </ul>
          </>
        )}
      </section>
    </ProfileView>
  );
}

function MyProfile({ uid, profile }: { uid: string; profile: UserProfile }) {
  const { refresh } = useUser();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProfileForm
        initial={profile}
        submitLabel="Guardar cambios"
        onSubmit={async (draft) => {
          await saveProfile(uid, draft);
          await refresh();
          toast.success("Perfil guardado.");
          setEditing(false);
        }}
      />
    );
  }
  return (
    <ProfileView profile={profile} mine>
      <div className="flex flex-col gap-2">
        <Button onClick={() => setEditing(true)} size="lg">
          <PencilIcon aria-hidden /> Editar mi perfil
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={async () => {
            await signOut(auth);
            router.replace("/login/");
          }}
        >
          <LogOutIcon aria-hidden /> Cerrar sesión
        </Button>
      </div>
    </ProfileView>
  );
}

function ProfileScreen() {
  const uid = useSearchParams().get("uid");
  return (
    <RequireUser>
      {({ user, profile }) =>
        !profile ? null : uid && uid !== user.uid ? (
          <OtherProfile key={uid} uid={uid} me={profile} />
        ) : (
          <MyProfile uid={user.uid} profile={profile} />
        )
      }
    </RequireUser>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-40" />}>
      <ProfileScreen />
    </Suspense>
  );
}
