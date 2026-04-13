/**
 * Convert a string to a URL-safe slug.
 * - Lowercase, strip diacritics, replace non-alphanumeric with hyphens, trim hyphens.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
