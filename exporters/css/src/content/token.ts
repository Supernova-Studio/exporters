import { DesignSystemCollection } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import { NamingHelper, CSSHelper, GeneralHelper } from "@supernovaio/export-utils"
import { ColorToken, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
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
 * Converts a token to its raw CSS value without following references.
 * This is used to generate fallback values for references.
 * 
 * @param token - The token to convert to raw CSS value
 * @param mappedTokens - Map of all tokens (needed for CSSHelper)
 * @returns Raw CSS value string
 */
export function getTokenRawValue(
  token: Token,
  mappedTokens: Map<string, Token>
): string {
  return CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: false, // Don't follow references to avoid infinite loops
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    tokenToVariableRef: () => "", // Stub function that never gets called since allowReferences is false
  })
}

/** The channels of a color token without alpha, e.g. "16, 79, 198", or "52.4% 0.25 265.1" in the OKLCH formats */
function colorTokenChannels(token: Token): string {
  return CSSHelper.colorChannels((token as ColorToken).value, exportConfiguration.colorFormat)
}

/**
 * Generates the channel variable of a color token (`--rgb-…`, or `--oklch-…` in the OKLCH formats).
 * It holds only the channels (no alpha), for colors that add their own opacity on top of this color.
 * 
 * @param token - The color token to generate the channel variable for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Formatted CSS custom property string for the channel variable
 */
export function generateChannelVariable(
  token: Token,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = []
): string {
  const name = tokenVariableName(token, tokenGroups, collections)
  const prefix = CSSHelper.channelPrefix(exportConfiguration.colorFormat)
  const declaration = `--${prefix}-${name}: ${colorTokenChannels(token)};`
  
  const indentString = GeneralHelper.indent(exportConfiguration.indent)
  
  // Add description comment if enabled and description exists
  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}/* ${prefix.toUpperCase()} utility for ${token.description.trim()} */\n${indentString}${declaration}`
  } else {
    return `${indentString}${declaration}`
  }
}

/**
 * Converts a design token into its CSS custom property representation.
 * Handles formatting of the token value, references, and optional description comments.
 *
 * @param token - The design token to convert
 * @param mappedTokens - Map of all tokens for resolving references
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @param colorTokensNeedingChannels - Set of color token IDs that need a channel variable
 * @returns Formatted CSS custom property string with optional description comment and channel variable
 */
export function convertedToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = [],
  colorTokensNeedingChannels?: Set<string>
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
    writesColorChannels: true,
    // Custom handler for token references - converts them to CSS var() syntax
    // When context.needsRgb is true, returns the channel variable for color tokens
    // When useFallbackValues is enabled, includes raw token value as fallback
    tokenToVariableRef: (t, context) => {
      const variableName = tokenVariableName(t, tokenGroups, collections)
      
      if (context?.needsRgb && t.tokenType === TokenType.color && colorTokensNeedingChannels?.has(t.id)) {
        if (exportConfiguration.useFallbackValues) {
          return `var(--${CSSHelper.channelPrefix(exportConfiguration.colorFormat)}-${variableName}, ${colorTokenChannels(t)})`
        }
        return `var(--${CSSHelper.channelPrefix(exportConfiguration.colorFormat)}-${variableName})`
      }
      
      if (exportConfiguration.useFallbackValues) {
        const rawValue = getTokenRawValue(t, mappedTokens)
        return `var(--${variableName}, ${rawValue})`
      }
      return `var(--${variableName})`
    },
  })
  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  let output = ""
  
  // Add description comment if enabled and description exists
  if (exportConfiguration.showDescriptions && token.description) {
    output += `${indentString}/* ${token.description.trim()} */\n`
  }
  
  // Add the main token variable
  output += `${indentString}--${name}: ${value};`
  
  // Generate the channel variable if this color token needs one
  if (token.tokenType === TokenType.color && colorTokensNeedingChannels?.has(token.id)) {
    output += `\n${generateChannelVariable(token, tokenGroups, collections)}`
  }
  
  return output
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
    [exportConfiguration.globalNamePrefix, prefix, collection?.name].filter(Boolean).join('-')
  )
}
