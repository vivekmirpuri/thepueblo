/**
 * The form to create an event (F8), with the similar-event warning (F9) — Track B. PLACEHOLDER.
 *
 * To build (B1, then B5):
 *  - shadcn <Field>, <Input>, <Textarea>, <Select> (category), date and time inputs, capacity.
 *  - In person: pick the place by tapping <EventMap onPick>. Online: a link field instead.
 *  - `imageUrl` is a pasted link (no uploads on the Spark plan). Show a preview.
 *  - `endsAt` is required; default it to two hours after `startsAt`.
 *  - B5: as the title and description change (debounced), call `findSimilarEvents` from "@/lib/ai"
 *    and show the results as <EventCard>s above the submit button: "Similar events — join one instead?"
 *  - Presentational: props are `onSubmit(event)` and the list of existing events; the page saves.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function EventForm() {
  return <Placeholder title="EventForm" track="B" features="F8 · F9" />;
}
