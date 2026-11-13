"use client";
/**
 * Guards the screens that need an account — SHARED. Built (not a placeholder).
 *
 * Signed out → /login/. Signed in but onboarding not finished → /onboarding/.
 * While we are still checking it shows a skeleton, so nothing flashes on screen.
 *
 * Use it inside a page: <RequireUser>{(me) => …}</RequireUser>, where `me` is the profile.
 * Pass `needsProfile={false}` on the onboarding screen itself, where there is no profile yet.
 */
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/auth";
import type { UserProfile } from "@/lib/types";
import type { User } from "firebase/auth";

export function RequireUser({
  children,
  needsProfile = true,
}: {
  children: (me: { user: User; profile: UserProfile | null }) => ReactNode;
  needsProfile?: boolean;
}) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login/");
    else if (needsProfile && !profile) router.replace("/onboarding/");
  }, [loading, user, profile, needsProfile, router]);

  if (loading || !user || (needsProfile && !profile)) {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <span className="sr-only">Cargando…</span>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  return <>{children({ user, profile })}</>;
}
