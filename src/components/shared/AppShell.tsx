/**
 * The frame around every screen — SHARED. Built (not a placeholder).
 *
 * A centred column (phone-width content that still looks right on a laptop) with the logo bar
 * stuck to the top and the tab bar fixed at the bottom. The home screen may want the map to break out to full width later:
 * do that inside the page, not here.
 */
import { BottomNav } from "./BottomNav";
import { Logo } from "./Logo";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-2xl items-center px-4 sm:h-16">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 pb-20">{children}</main>
      <BottomNav />
    </>
  );
}
