/**
 * Safely parse an integer from a query parameter.
 * Returns the default value if the input is undefined, empty, or not a valid integer.
 */
export function safeParseInt(value: string | undefined, defaultValue: number): number {
  if (!value || value.trim() === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
