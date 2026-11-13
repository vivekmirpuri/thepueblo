/**
 * Root layout — SHARED file. Wraps every screen in the auth provider and the app frame
 * (tab bar), and mounts the toast container. Fonts: Geist via next/font.
 */
import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/shared/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

// Atkinson Hyperlegible Next is drawn so that letters are hard to confuse with one another;
// it was made for people with low vision. It is the app's reading font (see globals.css).
const reading = Atkinson_Hyperlegible_Next({
  variable: "--font-reading",
  subsets: ["latin"],
});

// Geist stays loaded for the logo lettering only.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlejeThePueblo",
  description: "Encuentros por las Islas Canarias, en tus idiomas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${reading.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
