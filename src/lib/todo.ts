/** Marks a planned function that is not built yet. It throws, so a missing piece is loud instead of silently wrong. */
export function todo(what: string, ...args: unknown[]): never {
  throw new Error(`Not built yet: ${what} (called with ${args.length} argument(s))`);
}
