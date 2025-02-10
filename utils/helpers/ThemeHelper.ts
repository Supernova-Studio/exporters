import { Token, TokenTheme, TokenType } from "@supernovaio/sdk-exporters"

export class ThemeHelper {
  /**
   * Checks if a token type has any themed tokens in a given theme
   */
  static hasThemedTokens(tokens: Array<Token>, type: TokenType, theme: TokenTheme): boolean {
    const tokensOfType = tokens.filter((token) => token.tokenType === type)
    const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id))
    return tokensOfType.some(token => overriddenTokenIds.has(token.id))
  }

  /**
   * Filters tokens to only include those that are themed
   */
  static filterThemedTokens(tokens: Array<Token>, theme: TokenTheme): Array<Token> {
    const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id))
    return tokens.filter(token => overriddenTokenIds.has(token.id))
  }

  /**
   * Gets theme path/name for file organization
   */
  static getThemePath(theme: TokenTheme | string): string {
    return typeof theme === 'string' ? theme : theme.name.toLowerCase()
  }

  /**
   * Gets display name for a theme
   */
  static getThemeName(theme: TokenTheme | string): string {
    return typeof theme === 'string' ? theme : theme.name
  }
} 