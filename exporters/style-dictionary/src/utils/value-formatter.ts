/**
 * Formats a value for Style Dictionary JSON output
 * Returns an object with a value property as required by Style Dictionary
 */
export function formatTokenValue(value: string): string {
  // Remove any template literal syntax
  if (value.startsWith('${') && value.endsWith('}')) {
    value = value.slice(2, -1)
  }
  
  // Remove quotes around values
  value = value.replace(/['"]/g, '')
  
  // Return the value property object
  return `{ "value": "${value}" }`
} 