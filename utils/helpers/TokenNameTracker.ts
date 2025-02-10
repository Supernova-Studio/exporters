import { Token, TokenGroup } from "@supernovaio/sdk-exporters"
import { NamingHelper } from "./NamingHelper"
import { StringCase } from "../enums/StringCase"

/**
 * Tracks and generates unique names for design tokens while maintaining consistency
 * across multiple references to the same token. This ensures that each token gets
 * a unique, code-safe name that can be used in generated code.
 */
export class TokenNameTracker {
  /** Maps token IDs to their generated unique names */
  private tokenNameMap = new Map<string, string>() // token.id -> generated name
  /** Maps generated names back to token IDs to check for naming conflicts */
  private nameToTokenMap = new Map<string, string>() // generated name -> token.id

  /**
   * Clears all stored token name mappings, effectively resetting the tracker state.
   */
  reset(): void {
    this.tokenNameMap.clear()
    this.nameToTokenMap.clear()
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
  getTokenName(
    token: Token,
    tokenGroups: Array<TokenGroup>,
    format: StringCase,
    prefix: string | null,
    forExport: boolean = false
  ): string {
    // If we're looking up a name for reference and it was already generated, use that
    if (!forExport && this.tokenNameMap.has(token.id)) {
      return this.tokenNameMap.get(token.id)!
    }

    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
    
    // Get the base name
    let name = NamingHelper.codeSafeVariableNameForToken(token, format, parent, prefix)
    let counter = 1

    // If name is taken by a different token, add a suffix
    while (this.nameToTokenMap.has(name) && this.nameToTokenMap.get(name) !== token.id) {
      name = `${name}_copy_${counter++}`
    }

    // Track the name if not for export
    if (!forExport) {
      this.tokenNameMap.set(token.id, name)
      this.nameToTokenMap.set(name, token.id)
    }
    
    return name
  }
} 