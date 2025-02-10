import { Token, TokenGroup } from "@supernovaio/sdk-exporters";
import { StringCase } from "../enums/StringCase";
/**
 * Tracks and generates unique names for design tokens while maintaining consistency
 * across multiple references to the same token. This ensures that each token gets
 * a unique, code-safe name that can be used in generated code.
 */
export declare class TokenNameTracker {
    /** Maps token IDs to their generated unique names and values */
    private tokenNameMap;
    /** Maps generated names back to token IDs and values to check for naming conflicts */
    private nameToTokenMap;
    /**
     * Clears all stored token name mappings, effectively resetting the tracker state.
     */
    reset(): void;
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
    getTokenName(token: Token, tokenGroups: Array<TokenGroup>, format: StringCase, prefix: string | null, forExport?: boolean): string;
}
