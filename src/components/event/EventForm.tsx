/**
 * The form to create an event (F8), with the similar-event warning (F9) — Track B. PLACEHOLDER.
 *
 * To build (B1, then B5):
 *  - shadcn <Field>, <Input>, <Textarea>, <Select> (category), date and time inputs, capacity.
 *  - In person: pick the place by tapping <EventMap onPick>. Online: a link field instead.
 *  - Cover image: an <input type="file" accept="image/*">; on submit call `uploadEventImage(uid, file)`
 *    from "@/lib/db" and save the link it returns as `imageUrl`. Show a preview; max 5 MB (the rules enforce it).
 *  - `endsAt` is required; default it to two hours after `startsAt`.
 *  - B5: as the title and description change (debounced), call `findSimilarEvents` from "@/lib/ai"
 *    and show the results as <EventCard>s above the submit button: "Similar events — join one instead?"
 *  - Presentational: props are `onSubmit(event)` and the list of existing events; the page saves.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function EventForm() {
  return <Placeholder title="EventForm" track="B" features="F8 · F9" />;
}
