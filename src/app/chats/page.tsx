/**
 * My group chats, and one chat when `?event=` is set — Track B. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (B4):
 *  - No `?event=`: list the events I joined (`attendeeIds` contains my uid) as <EventCard>s.
 *  - With `?event=<id>`: show <ChatThread> for that event. Read the id with `useSearchParams()`
 *    inside a <Suspense> — the static export has no dynamic routes like /chats/[id].
 */
import { ChatThread } from "@/components/chat/ChatThread";
import { Placeholder } from "@/components/shared/Placeholder";

export default function ChatsPage() {
  return (
    <>
      <Placeholder title="Chats" track="B" features="F14" />
      <ChatThread />
    </>
  );
}
