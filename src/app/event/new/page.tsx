/**
 * Create an event — Track B. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (B1, B5):
 *  - Client container around <EventForm>: load existing events (for the similar-event check),
 *    save with `createEvent` from "@/lib/db", then go to the new event's page.
 *  - Signed out → send to "/login/".
 *  - `official` may be true only when my profile is a verified institution (the rules enforce it).
 */
import { EventForm } from "@/components/event/EventForm";
import { Placeholder } from "@/components/shared/Placeholder";

export default function NewEventPage() {
  return (
    <>
      <Placeholder title="New event" track="B" features="F8 · F9" />
      <EventForm />
    </>
  );
}
