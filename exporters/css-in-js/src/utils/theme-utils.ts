import { Token, TokenTheme, TokenType } from "@supernovaio/sdk-exporters"

/**
 * Checks if a token type has any themed tokens in a given theme
 * @param tokens - All tokens
 * @param type - Token type to check
 * @param theme - Theme to check against
 * @returns True if the type has any themed tokens
 */
export function hasThemedTokens(tokens: Array<Token>, type: TokenType, theme: TokenTheme): boolean {
  const tokensOfType = tokens.filter((token) => token.tokenType === type)
  const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id))
  return tokensOfType.some(token => overriddenTokenIds.has(token.id))
}

/**
 * Filters tokens to only include those that are themed
 * @param tokens - Tokens to filter
 * @param theme - Theme to check against
 * @returns Filtered array of tokens that have theme overrides
 */
export function filterThemedTokens(tokens: Array<Token>, theme: TokenTheme): Array<Token> {
  const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id))
  return tokens.filter(token => overriddenTokenIds.has(token.id))
}

export function getThemeIdentifier(theme: TokenTheme | string): string {
  if (typeof theme === 'string') return theme
  return theme.codeName?.toLowerCase() || theme.name.toLowerCase()
}

export function getThemeName(theme: TokenTheme | string): string {
  if (typeof theme === 'string') return theme
  const identifier = theme.codeName || theme.name
  return identifier.charAt(0).toUpperCase() + identifier.slice(1)
} 