"use client";
/**
 * Sign in or create an account (F1) — Built (not a placeholder).
 * Pattern: this page is the CONTAINER (talks to Firebase Auth and redirects); it draws its own
 * small form because no other screen reuses it.
 *
 * Two ways in: Google (one tap, no password to remember) or email and password. Google needs the
 * provider switched on in the Firebase console (Authentication → Sign-in method → Google).
 * After signing in: someone with a profile goes to the map, someone without one to /onboarding/.
 */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/auth";
import { getProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";

/** Firebase error codes, said in plain Spanish. Anything else gets the general message. */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Ese correo no parece válido.",
  "auth/email-already-in-use": "Ya hay una cuenta con ese correo. Entra en lugar de crear una.",
  "auth/weak-password": "La contraseña necesita 6 letras o números como mínimo.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento y vuelve a probar.",
  "auth/network-request-failed": "No hay conexión. Revisa tu internet.",
  "auth/popup-blocked": "El navegador ha bloqueado la ventana de Google. Permítela y prueba otra vez.",
  "auth/operation-not-allowed": "La entrada con Google todavía no está activada. Usa tu correo.",
  "auth/unauthorized-domain": "La entrada con Google no funciona en esta dirección. Usa tu correo.",
};

/** The official four-colour Google "G", as Google asks for in sign-in buttons. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function LoginPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"google" | "email" | null>(null);

  // Already signed in? Nothing to do here.
  useEffect(() => {
    if (!loading && user) router.replace(profile ? "/" : "/onboarding/");
  }, [loading, user, profile, router]);

  async function finish(signedIn: User) {
    router.replace((await getProfile(signedIn.uid)) ? "/" : "/onboarding/");
  }

  function fail(error: unknown) {
    const code = (error as { code?: string }).code ?? "";
    // Closing the Google window is a choice, not an error.
    if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
      toast.error(MESSAGES[code] ?? "No se ha podido entrar. Inténtalo otra vez.");
    }
    setBusy(null);
  }

  async function withGoogle() {
    setBusy("google");
    try {
      await finish((await signInWithPopup(auth, new GoogleAuthProvider())).user);
    } catch (error) {
      fail(error);
    }
  }

  async function withEmail(event: React.FormEvent) {
    event.preventDefault();
    setBusy("email");
    try {
      const credential =
        mode === "in"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);
      await finish(credential.user);
    } catch (error) {
      fail(error);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-8 p-4">
      <header className="flex flex-col items-center gap-4 text-center">
        <Logo />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Conoce gente cerca de ti</h1>
          <p className="text-sm text-muted-foreground">
            Actividades por las Islas Canarias, en tus idiomas y para todo el mundo.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full gap-3 text-base"
          onClick={withGoogle}
          disabled={busy !== null}
        >
          <GoogleMark />
          {busy === "google" ? "Un momento…" : "Continuar con Google"}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground" role="separator">
          <span className="h-px flex-1 bg-border" />o con tu correo
          <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs value={mode} onValueChange={(next) => setMode(String(next))}>
          <TabsList className="w-full">
            <TabsTrigger value="in" className="flex-1">Entrar</TabsTrigger>
            <TabsTrigger value="up" className="flex-1">Crear cuenta</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={withEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              className="h-12"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "in" ? "Tu contraseña" : "Mínimo 6 letras o números"}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                className="h-12 pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 size-10 -translate-y-1/2"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              </Button>
            </div>
          </div>
          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={busy !== null}>
            {busy === "email" ? "Un momento…" : mode === "in" ? "Entrar" : "Crear mi cuenta"}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Solo guardamos lo que escribas en tu perfil. Nunca guardamos dónde estás exactamente.
      </p>
    </div>
  );
}
