/**
 * Formats an ISO date string into a human-readable date.
 * e.g. "2024-03-06T10:00:00.000Z" → "Mar 6, 2024"
 */
export const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    });
  } catch {
    return iso;
  }
};

/**
 * Formats a Unix timestamp (seconds) into a human-readable date.
 * e.g. 1709712000 → "March 6, 2024"
 */
export const formatTimestamp = (ts: number): string => {
  try {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day:   'numeric',
      year:  'numeric',
    });
  } catch {
    return String(ts);
  }
};