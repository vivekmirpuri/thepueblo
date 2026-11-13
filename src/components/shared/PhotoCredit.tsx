/**
 * Who took a photo — SHARED. Built (not a placeholder).
 *
 * The demo photos come from Wikimedia Commons under CC BY / CC BY-SA, which require naming the
 * author and the licence wherever the photo is shown. Photos people upload themselves have no
 * credit, and then this renders nothing. Sits over the bottom-right corner of the image.
 */
export function PhotoCredit({ credit, href }: { credit?: string | null; href?: string | null }) {
  if (!credit) return null;
  const text = `Foto: ${credit}`;
  return (
    <span className="absolute right-1.5 bottom-1.5 max-w-[85%] truncate rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline" onClick={(event) => event.stopPropagation()}>
          {text}
        </a>
      ) : (
        text
      )}
    </span>
  );
}
