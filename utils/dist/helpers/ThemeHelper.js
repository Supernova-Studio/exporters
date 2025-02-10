"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeHelper = void 0;
const NamingHelper_1 = require("./NamingHelper");
const StringCase_1 = require("../enums/StringCase");
class ThemeHelper {
    /**
     * Checks if token type has any themed tokens in given theme
     * @param tokens - All tokens
     * @param type - Token type to check
     * @param theme - Theme to check against
     * @returns True if the type has any themed tokens
     */
    static hasThemedTokens(tokens, type, theme) {
        const tokensOfType = tokens.filter((token) => token.tokenType === type);
        const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id));
        return tokensOfType.some(token => overriddenTokenIds.has(token.id));
    }
    /**
     * Filters tokens to only include those that are themed
     * @param tokens - Tokens to filter
     * @param theme - Theme to check against
     * @returns Filtered array of tokens that have theme overrides
     */
    static filterThemedTokens(tokens, theme) {
        const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id));
        return tokens.filter(token => overriddenTokenIds.has(token.id));
    }
    /**
     * Gets theme identifier for file organization
     * @param theme - Theme object or string
     * @param stringCase - Case style to apply to the identifier (defaults to kebabCase)
     * @returns Normalized theme identifier in specified case
     */
    static getThemeIdentifier(theme, stringCase = StringCase_1.StringCase.kebabCase) {
        if (typeof theme === 'string')
            return theme;
        const identifier = theme.codeName || theme.name;
        return NamingHelper_1.NamingHelper.codeSafeVariableName(identifier, stringCase);
    }
    /**
     * Gets display name for theme
     * @param theme - Theme object or string
     * @returns Theme display name
     */
    static getThemeName(theme) {
        if (typeof theme === 'string')
            return theme;
        const identifier = theme.codeName || theme.name;
        return NamingHelper_1.NamingHelper.codeSafeVariableName(identifier, StringCase_1.StringCase.capitalCase);
    }
}
exports.ThemeHelper = ThemeHelper;
