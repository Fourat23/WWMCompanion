import { nanoid } from "nanoid";

/**
 * Generate a URL-safe slug from a title.
 * Appends a short random suffix to guarantee uniqueness.
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  const suffix = nanoid(8);
  return base ? `${base}-${suffix}` : suffix;
}
