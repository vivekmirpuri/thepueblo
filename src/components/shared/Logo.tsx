/**
 * thePueblo logo: the mark (same drawing as src/app/icon.svg, the browser-tab icon) and the
 * lettering in one SVG — SHARED. Inline so the lettering uses the app font (Geist) and
 * "Pueblo" follows the theme text colour (light and dark). Scales by height: smaller on phones.
 *
 * Lettering: "the" light and orange, "Pueblo" extra-bold, tight tracking, cap height centred on
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
      aria-label="thePueblo, home"
      className={cn(
        "inline-flex min-h-11 items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <svg viewBox="0 0 266 64" className="h-8 w-auto sm:h-10" aria-hidden>
        <rect width="64" height="64" rx="16" fill={BRAND} />
        <path fill="#fff" d="M32 55S17 40.5 17 27a15 15 0 0 1 30 0c0 13.5-15 28-15 28Z" />
        <path
          fill={BRAND}
          stroke={BRAND}
          strokeWidth="2"
          strokeLinejoin="round"
          d="M32 19.5 40 26.5V34H24v-7.5Z"
        />
        <path fill="#fff" d="M29.5 36v-6a2.5 2.5 0 0 1 5 0v6Z" />
        {/* Geist cap height is ~0.7em: baseline 46 puts the capitals' middle on the mark's centre (32). */}
        <text
          x="78"
          y="46"
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          fontSize="40"
          letterSpacing="-1.6"
        >
          <tspan fontWeight="400" className="fill-[#C2410C] dark:fill-[#FB923C]">
            the
          </tspan>
          <tspan fontWeight="800" fill="currentColor" dx="1">
            Pueblo
          </tspan>
        </text>
      </svg>
    </Link>
  );
}
