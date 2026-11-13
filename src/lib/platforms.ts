/**
 * Where an online activity happens — SHARED file.
 * The organiser picks one when the activity is "En línea"; cards and the detail page show it,
 * so people know before joining whether they need to install anything.
 */
export const PLATFORMS = [
  { id: "meet", label: "Google Meet" },
  { id: "zoom", label: "Zoom" },
  { id: "teams", label: "Microsoft Teams" },
  { id: "jitsi", label: "Jitsi Meet" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "discord", label: "Discord" },
  { id: "otra", label: "Otra" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export const platformLabel = (id: string | null | undefined) => PLATFORMS.find((item) => item.id === id)?.label;

/** "En línea" or "En línea · Zoom". */
export const onlineLabel = (id: string | null | undefined) => {
  const label = platformLabel(id);
  return label && id !== "otra" ? `En línea · ${label}` : "En línea";
};
