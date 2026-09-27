/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Strips accidental outer quotation marks (" or ') and leading/trailing whitespace
 * from environment variable values so that secrets provided with or without quotes
 * work identically and reliably.
 */
export function cleanEnv(val?: string | null): string {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();

  // Strip wrapping double quotes
  if (str.startsWith('"') && str.endsWith('"') && str.length >= 2) {
    str = str.slice(1, -1).trim();
  }
  // Strip wrapping single quotes
  if (str.startsWith("'") && str.endsWith("'") && str.length >= 2) {
    str = str.slice(1, -1).trim();
  }
  // In case of double-wrapped quotes like '""' or "''"
  if (
    (str.startsWith('"') && str.endsWith('"') && str.length >= 2) ||
    (str.startsWith("'") && str.endsWith("'") && str.length >= 2)
  ) {
    str = str.slice(1, -1).trim();
  }

  return str;
}

export function cleanEnvOrNull(val?: string | null): string | null {
  const cleaned = cleanEnv(val);
  return cleaned.length > 0 ? cleaned : null;
}
