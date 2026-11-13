/**
 * flejethepueblo logo: the mark (same drawing as src/app/icon.svg, the browser-tab icon) and the
 * lettering in one SVG — SHARED. Inline so the lettering uses the app font (Geist) and "pueblo"
 * follows the theme text colour (light and dark). Scales by height: smaller on phones.
 *
 * The mark is a pueblo — four little houses of different heights, because a village is more than
 * one house. Lettering: "flejethe" light and orange, "pueblo" extra-bold, cap height centred on
 * the mark. The text orange is deeper in light mode and lighter in dark mode so it stays readable.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

// Brand orange: a logo colour, not a UI colour, so it stays a fixed value.
const BRAND = "#E0572F";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="flejethepueblo, inicio"
      className={cn(
        "inline-flex min-h-11 items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <svg viewBox="0 0 344 64" className="h-8 w-auto sm:h-10" aria-hidden>
        <rect width="64" height="64" rx="16" fill={BRAND} />
        <g fill="#fff">
          <path d="M5 32 11 24 17 32V49H5Z" />
          <path d="M19 28 25.5 18 32 28V49H19Z" />
          <path d="M34 33 39.5 25 45 33V49H34Z" />
          <path d="M47 30 52.5 22 58 30V49H47Z" />
        </g>
        <g fill={BRAND}>
          <path d="M23 49v-7a2.5 2.5 0 0 1 5 0v7Z" />
          <rect x="9" y="36" width="4" height="4" rx="1" />
          <rect x="37.5" y="37" width="4" height="4" rx="1" />
          <rect x="50.5" y="34" width="4" height="4" rx="1" />
        </g>
        {/* Geist cap height is ~0.7em: baseline 45 puts the letters' middle on the mark's centre (32). */}
        <text
          x="78"
          y="45"
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          fontSize="38"
          letterSpacing="-1.5"
        >
          <tspan fontWeight="400" className="fill-[#C2410C] dark:fill-[#FB923C]">
            flejethe
          </tspan>
          <tspan fontWeight="800" fill="currentColor" dx="1">
            pueblo
          </tspan>
        </text>
      </svg>
    </Link>
  );
}
