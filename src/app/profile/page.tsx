/**
 * My profile: view, edit, sign out — Track C. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (C2):
 *  - Show the signed-in user's profile from `useUser()` ("@/lib/auth"); reuse the onboarding
 *    fields for editing.
 *  - A "Sign out" <Button> (`signOut(auth)`).
 *  - Signed out → send to "/login/".
 */
import { Placeholder } from "@/components/shared/Placeholder";

export default function ProfilePage() {
  return (
    <Placeholder title="Profile" track="C" features="F2" />
  );
}
