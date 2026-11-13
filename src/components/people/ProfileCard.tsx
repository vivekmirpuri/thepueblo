/**
 * One person in "Gente como tú" (F15) — Track C. Built (not a placeholder).
 *
 * Shows who they are (avatar, name, pronouns, island, a line about them) and, first and clearly,
 * what you have in common: shared interests with their icons and shared languages with their flags.
 * Presentational: the page works out the match and passes it in.
 */
import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { Flag } from "@/components/shared/LanguageFlags";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { PersonName } from "@/components/shared/PersonName";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { findCategory } from "@/lib/categories";
import { homeName } from "@/lib/islands";
import { LANGUAGES } from "@/lib/languages";
import { profileHref, type Match } from "@/lib/people";

export function ProfileCard({ match }: { match: Match }) {
  const { profile, interests, languages, sameIsland } = match;
  const common = interests.length + languages.length + (sameIsland ? 1 : 0);

  return (
    <Card className="relative py-0 transition-colors hover:bg-muted/40">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <PersonAvatar name={profile.displayName} avatar={profile.avatar} className="size-14 text-base" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold">
              <Link href={profileHref(profile.uid)} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring">
                <PersonName name={profile.displayName} pronouns={profile.pronouns} />
              </Link>
            </h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
              {homeName(profile.island) ?? "Sin isla"}
              {sameIsland && <span className="font-medium text-foreground"> · tu isla</span>}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {common} en común
          </Badge>
        </div>

        {profile.bio && <p className="line-clamp-2 text-sm">{profile.bio}</p>}

        {languages.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground">Os entendéis en</h3>
            <ul className="flex flex-wrap gap-1.5">
              {languages.map((code) => {
                const language = LANGUAGES.find((item) => item.code === code);
                return (
                  <li key={code}>
                    <Badge variant="outline">
                      <Flag flag={language?.flag} /> {language?.name ?? code}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {interests.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground">Os gusta</h3>
            <ul className="flex flex-wrap gap-1.5">
              {interests.map((id) => {
                const category = findCategory(id);
                if (!category) return null;
                const Icon = category.icon;
                return (
                  <li key={id}>
                    <Badge variant="outline">
                      <Icon className="size-3.5" aria-hidden /> {category.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
