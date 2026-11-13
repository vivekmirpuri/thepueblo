/**
 * The group chat of one event (F14) — Track B. PLACEHOLDER.
 *
 * To build (B4):
 *  - Bubbles: mine on the right, others on the left with <PersonName name pronouns> ("@/components/shared/PersonName"); newest at the bottom, auto-scroll.
 *  - An <Input> plus send <Button> pinned above the tab bar.
 *  - Presentational: props are `messages`, `myUid`, `onSend(text)`. The page subscribes with
 *    `watchMessages` from "@/lib/db" and unsubscribes when it unmounts.
 *  - Only attendees can read or write (firestore.rules); show "Join to chat" to everyone else.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function ChatThread() {
  return <Placeholder title="ChatThread" track="B" features="F14" />;
}
