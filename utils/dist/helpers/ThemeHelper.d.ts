import { Token, TokenTheme, TokenType } from "@supernovaio/sdk-exporters";
export declare class ThemeHelper {
    /**
     * Checks if token type has any themed tokens in given theme
     * @param tokens - All tokens
     * @param type - Token type to check
     * @param theme - Theme to check against
     * @returns True if the type has any themed tokens
     */
    static hasThemedTokens(tokens: Array<Token>, type: TokenType, theme: TokenTheme): boolean;
    /**
     * Filters tokens to only include those that are themed
     * @param tokens - Tokens to filter
     * @param theme - Theme to check against
     * @returns Filtered array of tokens that have theme overrides
     */
    static filterThemedTokens(tokens: Array<Token>, theme: TokenTheme): Array<Token>;
    /**
     * Gets theme identifier for file organization
     * @param theme - Theme object or string
     * @returns Normalized theme identifier in kebab-case
     */
    static getThemeIdentifier(theme: TokenTheme | string): string;
    /**
     * Gets display name for theme
     * @param theme - Theme object or string
     * @returns Theme display name
     */
    static getThemeName(theme: TokenTheme | string): string;
}
