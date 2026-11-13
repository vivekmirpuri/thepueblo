/**
 * People like you — Track C. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (C7):
 *  - Client container: `listProfiles()` from "@/lib/db", score each against my profile
 *    (shared interests + shared languages + same island), sort, show the top 20 as <ProfileCard>.
 *  - No model needed for the first version.
 */
import { ProfileCard } from "@/components/people/ProfileCard";
import { Placeholder } from "@/components/shared/Placeholder";

export default function PeoplePage() {
  return (
    <>
      <Placeholder title="People" track="C" features="F15" />
      <ProfileCard />
    </>
  );
}
