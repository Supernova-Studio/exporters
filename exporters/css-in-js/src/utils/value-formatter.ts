/**
 * Formats a value for CSS-in-JS output
 * - CSS values (with units or #) are wrapped in single quotes
 * - Values containing quotes are wrapped in single quotes
 * - References and other values are left as-is
 */
export function formatTokenValue(value: string): string {
  return value.includes('px') || value.includes('rem') || 
         value.includes('%') || value.includes('#') ||
         value.includes('"')
    ? `'${value}'`
    : value
} 