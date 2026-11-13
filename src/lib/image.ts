/**
 * Makes a phone photo safe to upload — SHARED file.
 *
 * Phone photos are often 5–12 MB (over the 5 MB limit in storage.rules) and iPhones save HEIC,
 * which most browsers cannot show. So before uploading we redraw the photo at most 1600 px wide
 * and save it as JPEG: a few hundred KB that every browser can display.
 * If the browser cannot decode the file, the original goes up unchanged and the rules decide.
 */
const MAX_SIDE = 1600;

export async function shrinkImage(file: File): Promise<Blob & { name?: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.85));
    if (!blob) return file;
    return Object.assign(blob, { name: file.name.replace(/\.[^.]+$/, "") + ".jpg" });
  } catch {
    return file;
  }
}
