"use client";
/**
 * The tab bar at the bottom of every screen — SHARED. Built (not a placeholder).
 *
 * Five tabs, like a phone app. To add or reorder a tab, edit TABS only.
 * Icons come from lucide-react (browse them at lucide.dev/icons).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapIcon, MessageCircleIcon, SparklesIcon, UserIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Map", icon: MapIcon },
  { href: "/chats/", label: "Chats", icon: MessageCircleIcon },
  { href: "/assistant/", label: "Assistant", icon: SparklesIcon },
  { href: "/people/", label: "People", icon: UsersIcon },
  { href: "/profile/", label: "Profile", icon: UserIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/90 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
