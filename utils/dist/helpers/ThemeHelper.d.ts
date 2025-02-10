import { Token, TokenTheme, TokenType } from "@supernovaio/sdk-exporters";
export declare class ThemeHelper {
    /**
     * Checks if a token type has any themed tokens in a given theme
     */
    static hasThemedTokens(tokens: Array<Token>, type: TokenType, theme: TokenTheme): boolean;
    /**
     * Filters tokens to only include those that are themed
     */
    static filterThemedTokens(tokens: Array<Token>, theme: TokenTheme): Array<Token>;
    /**
     * Gets theme path/name for file organization
     */
    static getThemePath(theme: TokenTheme | string): string;
    /**
     * Gets display name for a theme
     */
    static getThemeName(theme: TokenTheme | string): string;
}
