import { Token, TokenTheme, TokenType } from "@supernovaio/sdk-exporters"
import { NamingHelper } from "./NamingHelper"
import { StringCase } from "../enums/StringCase"

export class ThemeHelper {
  /**
   * Checks if token type has any themed tokens in given theme
   * @param tokens - All tokens
   * @param type - Token type to check
   * @param theme - Theme to check against
   * @returns True if the type has any themed tokens
   */
  static hasThemedTokens(tokens: Array<Token>, type: TokenType, theme: TokenTheme): boolean {
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
  static filterThemedTokens(tokens: Array<Token>, theme: TokenTheme): Array<Token> {
    const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id))
    return tokens.filter(token => overriddenTokenIds.has(token.id))
  }

  /**
   * Gets theme identifier for file organization
   * @param theme - Theme object or string
   * @param stringCase - Case style to apply to the identifier (defaults to kebabCase)
   * @returns Normalized theme identifier in specified case
   */
  static getThemeIdentifier(theme: TokenTheme | string, stringCase: StringCase = StringCase.kebabCase): string {
    if (typeof theme === 'string') return theme
    const identifier = theme.codeName || theme.name
    return NamingHelper.codeSafeVariableName(identifier, stringCase)
  }

  /**
   * Gets display name for theme
   * @param theme - Theme object or string
   * @returns Theme display name
   */
  static getThemeName(theme: TokenTheme | string): string {
    if (typeof theme === 'string') return theme
    const identifier = theme.codeName || theme.name
    return NamingHelper.codeSafeVariableName(identifier, StringCase.capitalCase)
  }
} 