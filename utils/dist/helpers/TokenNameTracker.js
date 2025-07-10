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
        /** Maps token IDs to their generated unique names */
        this.tokenNameMap = new Map(); // token.id -> generated name
        /** Maps generated names back to token IDs to check for naming conflicts */
        this.nameToTokenMap = new Map(); // generated name -> token.id
        /** Maps hierarchy level + name to token IDs */
        this.hierarchyNameMap = new Map(); // "path/name" -> Set of token IDs
    }
    /**
     * Clears all stored token name mappings, effectively resetting the tracker state.
     */
    reset() {
        this.tokenNameMap.clear();
        this.nameToTokenMap.clear();
        this.hierarchyNameMap.clear();
    }
    /**
     * Gets a clean, unique name for a token without any group prefixes.
     * Used for hierarchical structures where the path handles grouping.
     */
    getSimpleTokenName(token, format, forExport = false, path = [] // Add path parameter to check hierarchy level
    ) {
        // Create a unique key for this hierarchy level
        const hierarchyKey = path.join("/");
        const hierarchyFullKey = `${hierarchyKey}/${token.name}`;
        // If we're looking up a name for reference and it was already generated, use that
        if (!forExport && this.tokenNameMap.has(token.id)) {
            return this.tokenNameMap.get(token.id);
        }
        // Get the base name without any prefixes
        let name = NamingHelper_1.NamingHelper.codeSafeVariableName(token.name, format);
        // Get or create the set of token IDs for this hierarchy level and name
        if (!this.hierarchyNameMap.has(hierarchyFullKey)) {
            this.hierarchyNameMap.set(hierarchyFullKey, new Set());
        }
        const tokensAtLevel = this.hierarchyNameMap.get(hierarchyFullKey);
        // Only add suffix if there's another token with the same name at the same level
        if (tokensAtLevel.size > 0 && !tokensAtLevel.has(token.id)) {
            name = `${name}_${tokensAtLevel.size}`;
        }
        // Track the token at this hierarchy level
        tokensAtLevel.add(token.id);
        // Track the name if not for export
        if (!forExport) {
            this.tokenNameMap.set(token.id, name);
            this.nameToTokenMap.set(name, token.id);
        }
        return name;
    }
    /**
     * Generates or retrieves a unique, code-safe name for a given token.
     *
     * @param token - The design token that needs a name
     * @param tokenGroups - Array of all token groups, used to find the token's parent group
     * @param format - The desired case format for the generated name (e.g., camelCase, snake_case)
     * @param prefix - Optional prefix to add to the generated name
     * @param uniqueSuffix - Suffix that will be added to names to make them unique (if necessary)
     * @param forExport - If true, generates a new name without storing it. If false, stores and reuses names
     * @returns A unique, code-safe name for the token
     */
    getTokenName(token, tokenGroups, format, prefix, forExport = false, uniqueSuffix = "_copy_") {
        // If we're looking up a name for reference and it was already generated, use that
        if (!forExport && this.tokenNameMap.has(token.id)) {
            return this.tokenNameMap.get(token.id);
        }
        const parent = tokenGroups.find((group) => group.id === token.parentGroupId);
        // Get the base name
        let name = NamingHelper_1.NamingHelper.codeSafeVariableNameForToken(token, format, parent, prefix);
        let counter = 1;
        // If name is taken by a different token, add a suffix
        while (this.nameToTokenMap.has(name) && this.nameToTokenMap.get(name) !== token.id) {
            name = `${name}${uniqueSuffix}${counter++}`;
        }
        // Track the name if not for export
        if (!forExport) {
            this.tokenNameMap.set(token.id, name);
            this.nameToTokenMap.set(name, token.id);
        }
        return name;
    }
}
exports.TokenNameTracker = TokenNameTracker;
