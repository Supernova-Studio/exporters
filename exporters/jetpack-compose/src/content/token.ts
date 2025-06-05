import { DesignSystemCollection } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import {
  ColorFormat,
  GeneralHelper,
  ImportCollector,
  KotlinHelper,
  TokenToKotlinOptions
} from "@supernovaio/export-utils"

import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { tokenName } from "../utils/token-name-utils"
import { FileStructure } from "../../config"
import { getTokenTypeFileName } from "../utils/file-utils"
import { getObjectNameFromFileName, getObjectNameFromTokenType } from "../utils/object-utils"

/**
 * Gets the prefix for a specific token type based on configuration.
 * Uses either custom prefixes from configuration or default prefixes.
 * @param tokenType - The type of token (e.g., color, typography, etc.)
 * @returns The prefix string to use for this token type
 */
export function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes
    ? exportConfiguration.tokenPrefixes[tokenType]
    : DEFAULT_TOKEN_PREFIXES[tokenType]
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
  // Generate the variable name based on token properties and configuration
  const name = tokenName(token, tokenGroups, collections)

  const options = {
    colorFormat: ColorFormat.hex8,
    allowReferences: exportConfiguration.useReferences,
    decimals: 0,
    indent: exportConfiguration.indent,
    tokenToVariableRef: (refToken: Token) => {
      const name = tokenName(refToken, tokenGroups, collections)

      if (refToken.tokenType === token.tokenType || exportConfiguration.fileStructure === FileStructure.SingleFile) {
        // Both tokens in the same file - no need to do anything additionally

        return name
      } else {
        // Tokens are stored separately - we need to add a prefix and import another object

        importCollector.useTokenTypes(refToken.tokenType)

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
      ? `/* ${token.description.trim()} */\n${indentString}`
      : ""

  return `${indentString}${comment}val ${name} = ${value}`
}
