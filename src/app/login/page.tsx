"use client";
/**
 * Sign in or create an account (F1) — Built (not a placeholder).
 * Pattern: this page is the CONTAINER (talks to Firebase Auth and redirects); it draws its own
 * small form because no other screen reuses it.
 *
 * Email and password only: Google sign-in would need a public consent screen, and it can be added
 * later in the Firebase console without changing this file much.
 * After signing in: someone with a profile goes to the map, someone without one to /onboarding/.
 */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/auth";
import { getProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";

/** Firebase error codes, said in plain Spanish. Anything else gets the last, general message. */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Ese correo no parece válido.",
  "auth/email-already-in-use": "Ya hay una cuenta con ese correo. Entra en lugar de crear una.",
  "auth/weak-password": "La contraseña necesita 6 letras o números como mínimo.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento y vuelve a probar.",
  "auth/network-request-failed": "No hay conexión. Revisa tu internet.",
};

export default function LoginPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in? Nothing to do here.
  useEffect(() => {
    if (!loading && user) router.replace(profile ? "/" : "/onboarding/");
  }, [loading, user, profile, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const credential =
        mode === "in"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);
      router.replace((await getProfile(credential.user.uid)) ? "/" : "/onboarding/");
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      toast.error(MESSAGES[code] ?? "No se ha podido entrar. Inténtalo otra vez.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 p-4 pt-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="text-sm text-muted-foreground">
          Encuentros por las Islas Canarias, en tus idiomas.
        </p>
      </div>

      <Tabs value={mode} onValueChange={(next) => setMode(String(next))}>
        <TabsList className="w-full">
          <TabsTrigger value="in" className="flex-1">Entrar</TabsTrigger>
          <TabsTrigger value="up" className="flex-1">Crear cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="in" />
        <TabsContent value="up" />
      </Tabs>

      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Tu correo"
          aria-label="Correo electrónico"
          autoComplete="email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña"
          aria-label="Contraseña"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Un momento…" : mode === "in" ? "Entrar" : "Crear mi cuenta"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Solo guardamos lo que escribas en tu perfil. Nunca guardamos dónde estás exactamente.
      </p>
    </div>
  );
}
