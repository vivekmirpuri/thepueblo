"use client";
/**
 * My profile: see it, edit it, sign out (F2) — Built (not a placeholder).
 * Pattern: this page is the CONTAINER (loads nothing of its own — the profile comes from
 * useUser() — saves changes and signs out); <ProfileForm> draws the edit form.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { BadgeCheckIcon, LogOutIcon, MapPinIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { ProfileForm } from "@/components/people/ProfileForm";
import { PersonName } from "@/components/shared/PersonName";
import { RequireUser } from "@/components/shared/RequireUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth";
import { findCategory } from "@/lib/categories";
import { saveProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { homeName } from "@/lib/islands";
import { LANGUAGES } from "@/lib/languages";
import { AVAILABILITY, PREFERS } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "?";

function ProfileView({ profile, onEdit }: { profile: UserProfile; onEdit: () => void }) {
  const router = useRouter();
  const island = homeName(profile.island);
  const prefers = PREFERS.find((item) => item.id === profile.prefers);

  return (
    <div className="space-y-6 p-4">
      <header className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-lg">{initials(profile.displayName)}</AvatarFallback>
        </Avatar>
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

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Idiomas que hablo</h2>
        <ul className="flex flex-wrap gap-2">
          {profile.languages.map((code) => {
            const language = LANGUAGES.find((item) => item.code === code);
            return (
              <li key={code}>
                <Badge variant="outline">
                  <span aria-hidden>{language?.flag}</span> {language?.name ?? code}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Me interesa</h2>
        {profile.interests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no has elegido temas.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {profile.interests.map((id) => {
              const category = findCategory(id);
              if (!category) return null;
              const Icon = category.icon;
              return (
                <li key={id}>
                  <Badge variant="outline">
                    <Icon className="size-3.5" aria-hidden /> {category.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-1 text-sm text-muted-foreground">
        <h2 className="text-sm font-semibold text-foreground">Cómo quedo</h2>
        <p>{prefers?.label}</p>
        {profile.availability.length > 0 && (
          <p>
            {profile.availability
              .map((id) => AVAILABILITY.find((item) => item.id === id)?.label ?? id)
              .join(" · ")}
          </p>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <Button onClick={onEdit} size="lg">
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
    </div>
  );
}

export default function ProfilePage() {
  const { refresh } = useUser();
  const [editing, setEditing] = useState(false);

  return (
    <RequireUser>
      {({ user, profile }) =>
        !profile ? null : editing ? (
          <ProfileForm
            initial={profile}
            submitLabel="Guardar cambios"
            onSubmit={async (draft) => {
              await saveProfile(user.uid, draft);
              await refresh();
              toast.success("Perfil guardado.");
              setEditing(false);
            }}
          />
        ) : (
          <ProfileView profile={profile} onEdit={() => setEditing(true)} />
        )
      }
    </RequireUser>
  );
}
