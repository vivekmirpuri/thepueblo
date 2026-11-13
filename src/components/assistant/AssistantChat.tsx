/**
 * The assistant conversation (F16) — Track C. PLACEHOLDER.
 *
 * To build (C4 → C6):
 *  - Two entry points: a "Suggest for me" <Button> (calls `recommendEvents`) and a free-text
 *    <Input> (calls `searchEvents`), both from "@/lib/ai".
 *  - Every answer is a list of <EventCard>s. That list alone must answer the question.
 *  - C6, optional: when the device can run the chat model, add two or three sentences about
 *    those events above the cards; otherwise show a fixed sentence. Show model download progress.
 *  - Everything runs on the device: say so in the screen ("Runs on your device — nothing is sent").
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function AssistantChat() {
  return <Placeholder title="AssistantChat" track="C" features="F16" />;
}
