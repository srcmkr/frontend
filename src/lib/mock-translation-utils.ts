/**
 * Mock Translation Utilities
 *
 * This module provides utilities to translate mock data that contains translation keys.
 * Mock data uses a special format: "translationKey|{jsonParams}"
 *
 * Example:
 * - Input: 'notifications.mockData.monitorDown.title|{"monitorName":"Mail Server"}'
 * - Output: "Monitor \"Mail Server\" is offline" (EN) or "Monitor \"Mail Server\" ist offline" (DE)
 */

/**
 * Parses a translation string that contains a key and JSON parameters
 * Format: "translation.key|{json params}"
 */
export function parseTranslationString(str: string): {
  key: string;
  params: Record<string, string | number>;
} | null {
  // Check if string contains translation key marker
  if (!str.includes('notifications.mockData.')) {
    return null;
  }

  const parts = str.split('|');
  if (parts.length !== 2) {
    return null;
  }

  try {
    const key = parts[0];
    const params = JSON.parse(parts[1]);
    return { key, params };
  } catch {
    return null;
  }
}

/**
 * Recursively translates nested translation keys in parameters
 */
function translateNestedKeys(
  params: Record<string, string | number>,
  t: (key: string) => string
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.startsWith('notifications.mockData.')) {
      // This is a nested translation key
      const nestedKey = value.replace('notifications.mockData.', '');
      result[key] = t(nestedKey);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Translates a mock data string using the provided translation function
 *
 * @param str - The string to translate (may contain translation key or be plain text)
 * @param t - The translation function from useTranslations('notifications.mockData')
 * @returns The translated string
 */
export function translateMockString(
  str: string,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  const parsed = parseTranslationString(str);

  if (!parsed) {
    // Not a translation string, return as-is
    return str;
  }

  // Extract the key part after 'notifications.mockData.'
  const translationKey = parsed.key.replace('notifications.mockData.', '');

  // Translate any nested keys in parameters
  const translatedParams = translateNestedKeys(parsed.params, t);

  // Return translated string with parameters
  return t(translationKey, translatedParams);
}

/**
 * Hook to translate notification objects from mock data
 *
 * Usage in components:
 * ```tsx
 * import { useTranslations } from 'next-intl';
 * import { translateMockString } from '@/lib/mock-translation-utils';
 *
 * function NotificationComponent({ notification }) {
 *   const t = useTranslations('notifications.mockData');
 *
 *   const translatedTitle = translateMockString(notification.title, t);
 *   const translatedMessage = translateMockString(notification.message, t);
 *
 *   return (
 *     <div>
 *       <h3>{translatedTitle}</h3>
 *       <p>{translatedMessage}</p>
 *     </div>
 *   );
 * }
 * ```
 */
