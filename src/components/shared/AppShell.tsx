/**
 * The frame around every screen — SHARED. Built (not a placeholder).
 *
 * A centred column (phone-width content that still looks right on a laptop) with the tab bar
 * fixed at the bottom. The home screen may want the map to break out to full width later:
 * do that inside the page, not here.
 */
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto w-full max-w-2xl flex-1 pb-20">{children}</main>
      <BottomNav />
    </>
  );
}
