import { DesignSystemCollection } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import {
  ColorFormat,
  GeneralHelper,
  ImportCollector,
  KotlinHelper,
  NamingHelper,
  StringCase,
  TokenNameTracker,
  TokenToKotlinOptions
} from "@supernovaio/export-utils"

import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { FileStructure, TokenNameStructure } from "../../config"
import { getObjectNameFromTokenType } from "../utils/object-utils"

/**
 * Create a single instance of the tracker for consistent name generation
 */
const tokenNameTracker = new TokenNameTracker()

/**
 * Gets the prefix for a specific token type based on configuration.
 * Uses either custom prefixes from configuration or default prefixes.
 * @param tokenType - The type of token (e.g., color, typography, etc.)
 * @returns The prefix string to use for this token type
 */
function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes
    ? exportConfiguration.tokenPrefixes[tokenType]
    : DEFAULT_TOKEN_PREFIXES[tokenType]
}

/**
 * Use the tracker's reset method instead of managing maps directly
 */
export function resetTokenNameTracking(): void {
  tokenNameTracker.reset()
}

/**
 * Generates a code-safe property name for a token based on its properties and configuration.
 * Includes type-specific prefix and considers token hierarchy and collection.
 *
 * @param token - The token to generate a name for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @param forExport - If true, generates a new name without storing it. If false, stores and reuses names
 * @returns Formatted property name string
 */
export function tokenPropertyName(
  token: Token,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection>,
  forExport: boolean = false
): string {
  // Find a collection if needed and exists
  let collection: DesignSystemCollection | null = null
  if (exportConfiguration.tokenNameStructure === TokenNameStructure.CollectionPathAndName && token.collectionId) {
    collection =
      collections.find((c) => c.persistentId === token.collectionId) ??
      ({ name: token.collectionId } as DesignSystemCollection)
  }

  const prefix = [exportConfiguration.globalNamePrefix, getTokenPrefix(token.tokenType), collection?.name]
    .filter(Boolean)
    .join("")

  return tokenNameTracker.getTokenName(token, tokenGroups, StringCase.camelCase, prefix, false, "Copy")
}

/**
 * Converts a design token into its Kotlin representation.
 * Handles formatting of the token value, references, and optional description comments.
 *
 * @param token - The design token to convert
 * @param mappedTokens - Map of all tokens for resolving references
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @param importCollector - Collector that gathers all imports for this token
 * @returns Formatted Kotlin string with optional description comment
 */
export function convertedToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = [],
  importCollector: ImportCollector
): string {
  // Generate the property name
  const name = tokenPropertyName(token, tokenGroups, collections)

  const options = {
    colorFormat: ColorFormat.hex8,
    allowReferences: exportConfiguration.useReferences,
    decimals: 0,
    indent: exportConfiguration.indent,
    tokenToVariableRef: (refToken: Token) => {
      const name = tokenPropertyName(refToken, tokenGroups, collections)

      if (refToken.tokenType === token.tokenType || exportConfiguration.fileStructure === FileStructure.SingleFile) {
        // Both tokens in the same file - no need to do anything additionally

        return name
      } else {
        // Tokens are stored separately - we need to add a prefix.
        // Imports are not necessary - all files in the same package.

        const prefix = getObjectNameFromTokenType(refToken.tokenType)
        return `${prefix}.${name}`
      }
    }
  } satisfies TokenToKotlinOptions

  // Convert token value to object instance, handling references and formatting according to configuration
  const value = KotlinHelper.tokenValue(token, mappedTokens, options, importCollector)
  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  // Add description comment if enabled and description exists
  const comment =
    exportConfiguration.showDescriptions && token.description?.trim()
      ? `/** ${token.description.trim()} */\n${indentString}`
      : ""

  return `${indentString}${comment}val ${name} = ${value}`
}
