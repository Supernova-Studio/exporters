"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeHelper = void 0;
class ThemeHelper {
    /**
     * Checks if a token type has any themed tokens in a given theme
     */
    static hasThemedTokens(tokens, type, theme) {
        const tokensOfType = tokens.filter((token) => token.tokenType === type);
        const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id));
        return tokensOfType.some(token => overriddenTokenIds.has(token.id));
    }
    /**
     * Filters tokens to only include those that are themed
     */
    static filterThemedTokens(tokens, theme) {
        const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id));
        return tokens.filter(token => overriddenTokenIds.has(token.id));
    }
    /**
     * Gets theme path/name for file organization
     */
    static getThemePath(theme) {
        return typeof theme === 'string' ? theme : theme.name.toLowerCase();
    }
    /**
     * Gets display name for a theme
     */
    static getThemeName(theme) {
        return typeof theme === 'string' ? theme : theme.name;
    }
}
exports.ThemeHelper = ThemeHelper;
