/**
 * A person's picture — SHARED. Built (not a placeholder).
 *
 * Their Canarian avatar if they chose one (src/lib/avatars.ts), otherwise their initials on a
 * soft circle. Decorative next to a visible name, so the image itself is hidden from screen readers.
 */
import { avatarSrc, findAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "?";

export function PersonAvatar({ name, avatar, className }: { name: string; avatar?: string | null; className?: string }) {
  const chosen = findAvatar(avatar);
  return (
    <span
      className={cn("inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium", className)}
      aria-hidden
    >
      {chosen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarSrc(chosen.id)} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
