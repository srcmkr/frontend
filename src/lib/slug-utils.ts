/**
 * Slug generation utility
 * Generates URL-friendly slugs from titles
 */

/**
 * Generate a URL-friendly slug from a title
 * Converts German umlauts and removes special characters
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (match) => {
      const map: Record<string, string> = {
        ä: "ae",
        ö: "oe",
        ü: "ue",
        ß: "ss",
      };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Check if a slug is unique
 * In production, this would make an API call to verify uniqueness
 * For now, we return true and let the backend validate
 */
export async function isSlugUnique(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  // TODO: Implement API call to check slug uniqueness
  // const result = await apiClient.get<{available: boolean}>(`/status-pages/check-slug/${slug}`, { excludeId });
  // return result.available;
  return true; // Backend will validate on create/update
}
