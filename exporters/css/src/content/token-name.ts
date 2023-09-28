import { Token, TokenGroup } from "@supernova-studio/pulsar-next"

export function tokenName(token: Token, tokenGroups: Array<TokenGroup>): string {
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
  return readableVariableName(token, parent, prefixes[token.tokenType])
}

/**
 * Convert group name, token name and possible prefix into camelCased string, joining everything together
 */
export function readableVariableName(token: Token, tokenGroup: TokenGroup, prefix: string | null) {
  // Create array with all path segments and token name at the end
  const segments = [...tokenGroup.path]
  if (!tokenGroup.isRoot) {
    segments.push(tokenGroup.name)
  }
  segments.push(token.name)

  if (prefix && prefix.length > 0) {
    segments.unshift(prefix)
  }

  // Create "sentence" separated by spaces so we can camelcase it all
  let sentence = segments.join(" ")

  // camelcase string from all segments
  sentence = sentence.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())

  // only allow letters, digits, underscore and hyphen
  sentence = sentence.replace(/[^a-zA-Z0-9_-]/g, "_")

  // prepend underscore if it starts with digit
  if (/^\d/.test(sentence)) {
    sentence = "_" + sentence
  }

  return sentence
}

/**
 * Behavior configuration of the exporter
 * Prefixes: Add prefix for each category of the tokens. For example, all colors can start with "color, if needed"
 */
export const prefixes = {
  colorTokenPrefix: "color",
  borderTokenPrefix: "border",
  gradientTokenPrefix: "gradient",
  measureTokenPrefix: "measure",
  shadowTokenPrefix: "shadow",
  typographyTokenPrefix: "typography",
}
