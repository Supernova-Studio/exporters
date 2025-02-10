"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenNameTracker = void 0;
const NamingHelper_1 = require("./NamingHelper");
/**
 * Tracks and generates unique names for design tokens while maintaining consistency
 * across multiple references to the same token. This ensures that each token gets
 * a unique, code-safe name that can be used in generated code.
 */
class TokenNameTracker {
    constructor() {
        /** Maps token IDs to their generated unique names and values */
        this.tokenNameMap = new Map(); // token.id -> { name, value }
        /** Maps generated names back to token IDs and values to check for naming conflicts */
        this.nameToTokenMap = new Map(); // generated name -> { id, value }
    }
    /**
     * Clears all stored token name mappings, effectively resetting the tracker state.
     */
    reset() {
        this.tokenNameMap.clear();
        this.nameToTokenMap.clear();
    }
    /**
     * Generates or retrieves a unique, code-safe name for a given token.
     *
     * @param token - The design token that needs a name
     * @param tokenGroups - Array of all token groups, used to find the token's parent group
     * @param format - The desired case format for the generated name (e.g., camelCase, snake_case)
     * @param prefix - Optional prefix to add to the generated name
     * @param forExport - If true, generates a new name without storing it. If false, stores and reuses names
     * @returns A unique, code-safe name for the token
     */
    getTokenName(token, tokenGroups, format, prefix, forExport = false) {
        // If we're looking up a name for reference and it was already generated, use that
        if (!forExport && this.tokenNameMap.has(token.id)) {
            return this.tokenNameMap.get(token.id).name;
        }
        const parent = tokenGroups.find((group) => group.id === token.parentGroupId);
        const tokenValue = token.value;
        // Get the base name
        let name = NamingHelper_1.NamingHelper.codeSafeVariableNameForToken(token, format, parent, prefix);
        // Check if name exists but belongs to a token with the same value
        if (this.nameToTokenMap.has(name)) {
            const existing = this.nameToTokenMap.get(name);
            // If tokens have the same value, reuse the name
            if (tokenValue === existing.value) {
                if (!forExport) {
                    this.tokenNameMap.set(token.id, { name, value: tokenValue });
                    // No need to update nameToTokenMap as we're reusing the existing name
                }
                return name;
            }
        }
        let counter = 1;
        // If name is taken by a different token with different value, add a suffix
        while (this.nameToTokenMap.has(name) && this.nameToTokenMap.get(name).id !== token.id) {
            name = `${name}_duplicate_${counter++}`;
        }
        // Track the name if not for export
        if (!forExport) {
            this.tokenNameMap.set(token.id, { name, value: tokenValue });
            this.nameToTokenMap.set(name, { id: token.id, value: tokenValue });
        }
        return name;
    }
}
exports.TokenNameTracker = TokenNameTracker;
