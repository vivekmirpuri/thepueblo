/**
 * One person in "People like you" (F15) — Track C. PLACEHOLDER.
 *
 * To build (C7):
 *  - shadcn <Card> with <Avatar>, <PersonName name pronouns>, island, shared interests as <Badge>s, and the flags of
 *    the languages they speak.
 *  - Props: `profile` and `shared` (which interests and languages you have in common).
 *  - The matching score lives in the page, not here: shared interests + shared languages + same island.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function ProfileCard() {
  return <Placeholder title="ProfileCard" track="C" features="F15" />;
}
