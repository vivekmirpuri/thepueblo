/**
 * Sign in or create an account — Track Foundation. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build:
 *  - Email + password with shadcn <Field>, <Input>, <Button>; one screen with a
 *    "Sign in / Create account" <Tabs> switch.
 *  - `signInWithEmailAndPassword` / `createUserWithEmailAndPassword` from "firebase/auth" with
 *    `auth` from "@/lib/firebase". Show errors with `toast.error` from "sonner".
 *  - After sign-in: profile exists → "/", otherwise → "/onboarding/".
 *  - Google sign-in is optional: it must first be switched on in the Firebase console.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export default function LoginPage() {
  return (
    <Placeholder title="Entrar" track="Foundation" features="F1" />
  );
}
