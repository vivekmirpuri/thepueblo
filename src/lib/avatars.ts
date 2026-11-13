/**
 * Canarian avatars people can pick instead of a photo — SHARED file.
 *
 * Nine illustrations of things from the islands. The images live in public/avatars/<id>.webp and
 * are cut out of one sheet by scripts/crop-avatars.py. A person with no avatar shows initials.
 * `label` is what a screen reader says and what appears under the image when choosing.
 */
export const AVATARS = [
  { id: "pintadera", label: "Pintadera" },
  { id: "papas", label: "Papas arrugadas con mojo" },
  { id: "millo", label: "Millo" },
  { id: "vieja", label: "Vieja" },
  { id: "sombrero", label: "Sombrero canario" },
  { id: "platano", label: "Plátano" },
  { id: "naife", label: "Naife" },
  { id: "lagarto", label: "Lagarto" },
  { id: "cabra", label: "Cabra" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export const avatarSrc = (id: string) => `/avatars/${id}.webp`;
export const findAvatar = (id: string | null | undefined) => AVATARS.find((avatar) => avatar.id === id);
