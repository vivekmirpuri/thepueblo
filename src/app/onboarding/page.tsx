"use client";
/**
 * First-time setup: pronouns, languages, interests, island and a couple of short questions
 * (F2, F3, F18) — Built (not a placeholder).
 * Pattern: this page is the CONTAINER (saves the profile and redirects); <ProfileForm> draws it.
 */
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProfileForm } from "@/components/people/ProfileForm";
import { RequireUser } from "@/components/shared/RequireUser";
import { useUser } from "@/lib/auth";
import { saveProfile } from "@/lib/db";

export default function OnboardingPage() {
  const { refresh } = useUser();
  const router = useRouter();

  return (
    <RequireUser needsProfile={false}>
      {({ user }) => (
        <>
          <header className="space-y-1 p-4 pb-0">
            <h1 className="text-2xl font-semibold">Te damos la bienvenida</h1>
            <p className="text-sm text-muted-foreground">
              Cuéntanos un poco de ti. Así te enseñamos encuentros que te encajen y verás con quién
              te vas a entender.
            </p>
          </header>
          <ProfileForm
            initial={{ displayName: user.displayName ?? "" }}
            submitLabel="Empezar"
            onSubmit={async (draft) => {
              await saveProfile(user.uid, draft);
              await refresh();
              toast.success("Listo. Ya puedes buscar encuentros.");
              router.replace("/");
            }}
          />
        </>
      )}
    </RequireUser>
  );
}
