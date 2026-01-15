/**
 * Formats a value for CSS-in-JS output
 * - Values with multiple references or mixed content are wrapped in template literals
 * - CSS values (with units or #) are wrapped in single quotes
 * - Single references are used directly
 * - Other values are left as-is
 */
export function formatTokenValue(value: string): string {
  // If it's a single reference (just ${something}), use it directly without backticks
  if (value.startsWith('${') && value.endsWith('}') && value.indexOf('${', 2) === -1) {
    return value.slice(2, -1)  // Remove the ${ and }
  }

  // If value contains references in a larger string, wrap in template literals
  if (value.includes('${')) {
    return `\`${value}\``
  }

  // Otherwise wrap CSS values in single quotes
  return `'${value}'`
} 