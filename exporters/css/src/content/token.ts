import { DesignSystemCollection } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import { NamingHelper, CSSHelper, GeneralHelper } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { TokenNameStructure } from "../../config"

/**
 * Gets the prefix for a specific token type based on configuration.
 * Uses either custom prefixes from configuration or default prefixes.
 * @param tokenType - The type of token (e.g., color, typography, etc.)
 * @returns The prefix string to use for this token type
 */
export function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes ? exportConfiguration.tokenPrefixes[tokenType] : DEFAULT_TOKEN_PREFIXES[tokenType]
}

/**
 * Converts a design token into its CSS custom property representation.
 * Handles formatting of the token value, references, and optional description comments.
 *
 * @param token - The design token to convert
 * @param mappedTokens - Map of all tokens for resolving references
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Formatted CSS custom property string with optional description comment
 */
export function convertedToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = []
): string {
  // Generate the CSS variable name based on token properties and configuration
  const name = tokenVariableName(token, tokenGroups, collections)

  // Convert token value to CSS, handling references and formatting according to configuration
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    // Custom handler for token references - converts them to CSS var() syntax
    tokenToVariableRef: (t) => {
      return `var(--${tokenVariableName(t, tokenGroups, collections)})`
    },
  })
  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  // Add description comment if enabled and description exists
  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}/* ${token.description.trim()} */\n${indentString}--${name}: ${value};`
  } else {
    return `${indentString}--${name}: ${value};`
  }
}

/**
 * Generates a code-safe variable name for a token based on its properties and configuration.
 * Includes type-specific prefix and considers token hierarchy and collection.
 *
 * @param token - The token to generate a name for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Formatted variable name string
 */
export function tokenVariableName(token: Token, tokenGroups: Array<TokenGroup>, collections: Array<DesignSystemCollection> = []): string {
  const prefix = getTokenPrefix(token.tokenType)
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!

  // Find collection if needed and exists
  let collection: DesignSystemCollection | null = null
  if (exportConfiguration.tokenNameStructure === TokenNameStructure.CollectionPathAndName && token.collectionId) {
    collection = collections.find((c) => c.persistentId === token.collectionId) ?? ({ name: token.collectionId } as DesignSystemCollection)
  }

  return NamingHelper.codeSafeVariableNameForToken(
    token,
    exportConfiguration.tokenNameStyle,
    exportConfiguration.tokenNameStructure !== TokenNameStructure.NameOnly ? parent : null,
    prefix,
    collection?.name,
    exportConfiguration.globalNamePrefix
  )
}
