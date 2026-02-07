/**
 * Server-side text sanitization.
 * Strips HTML tags to prevent XSS. Markdown is rendered client-side
 * using a safe renderer that escapes HTML.
 */

/** Strip all HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** Sanitize user text input: strip HTML, trim, limit length */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  const stripped = stripHtml(input);
  return stripped.trim().slice(0, maxLength);
}

/** Sanitize a slug: lowercase, alphanumeric + hyphens only */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
