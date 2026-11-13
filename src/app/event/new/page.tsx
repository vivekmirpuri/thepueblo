"use client";
/**
 * Create an activity (F8) — Track B. Built (not a placeholder).
 * Pattern: this page is the CONTAINER (uploads the photo, writes to Firestore and goes to the new
 * activity); <EventForm> draws the form.
 *
 * Whoever creates an activity is counted as going to it, so the flags already show their languages.
 */
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { EventForm } from "@/components/event/EventForm";
import { RequireUser } from "@/components/shared/RequireUser";
import { createEvent, uploadEventImage } from "@/lib/db";
import { shrinkImage } from "@/lib/image";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <RequireUser>
      {({ user, profile }) =>
        !profile ? null : (
          <>
            <header className="space-y-1 p-4 pb-0">
              <h1 className="text-2xl font-semibold">Crear una actividad</h1>
              <p className="text-sm text-muted-foreground">
                Cualquier plan vale: un café, una caminata, una charla. Lo verá la gente que esté cerca.
              </p>
            </header>
            <EventForm
              canPublishOfficial={profile.role === "institution" && profile.verified}
              onSubmit={async (values) => {
                const imageUrl = values.image ? await uploadEventImage(user.uid, await shrinkImage(values.image)) : null;
                const id = await createEvent({
                  title: values.title,
                  description: values.description,
                  category: values.category,
                  imageUrl,
                  official: values.official,
                  organizerId: user.uid,
                  organizerName: profile.displayName,
                  mode: values.mode,
                  location: values.location,
                  placeName: values.placeName,
                  island: values.mode === "in_person" && profile.island !== "otro" ? profile.island : null,
                  onlineUrl: values.onlineUrl,
                  onlinePlatform: values.onlinePlatform,
                  startsAt: Timestamp.fromDate(values.startsAt),
                  endsAt: Timestamp.fromDate(values.endsAt),
                  capacity: values.capacity,
                  inclusion: values.inclusion,
                  attendeeIds: [user.uid],
                  attendeeLanguages: { [user.uid]: profile.languages },
                  embedding: null,
                });
                toast.success("¡Publicada! Ya se ve en el mapa.");
                router.replace(`/event/?id=${id}`);
              }}
            />
          </>
        )
      }
    </RequireUser>
  );
}
