import {
  DesignSystemCollection
} from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import {
  ColorFormat,
  ColorFormatOptions,
  GeneralHelper,
  KotlinHelper,
  TokenToKotlinOptions
} from "@supernovaio/export-utils"

import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { tokenName } from "../utils/token-name-utils"

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
  // Generate the variable name based on token properties and configuration
  const name = tokenName(token, tokenGroups, collections)

  const options = {
    colorFormat: ColorFormat.hex8,
    allowReferences: exportConfiguration.useReferences,
    decimals: 0,
    indent: exportConfiguration.indent,
    tokenToVariableRef: (token: Token) => {
      return tokenName(token, tokenGroups, collections)
    },
  } satisfies TokenToKotlinOptions

  // Convert token value to object instance, handling references and formatting according to configuration
  const value = KotlinHelper.tokenValue(token, mappedTokens, options)
  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  // Add description comment if enabled and description exists
  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}/* ${token.description.trim()} */\n${indentString}val ${name} = ${value}`
  } else {
    return `${indentString}val ${name} = ${value}`
  }
}

