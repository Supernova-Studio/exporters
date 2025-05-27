import {
  DesignSystemCollection
} from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import {
  NamingHelper,
  CSSHelper,
  GeneralHelper,
  TokenToCSSOptions,
  ColorHelper,
  ColorFormat, StringCase
} from "@supernovaio/export-utils"

import {
  AnyDimensionToken, AnyOptionToken, AnyStringToken, BlurToken,
  BorderToken,
  ColorToken, ColorTokenValue,
  FontWeightToken,
  GradientToken, ShadowToken,
  Token,
  TokenGroup,
  TokenType, TypographyToken, UnreachableCaseError
} from "@supernovaio/sdk-exporters"
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
  // Generate the variable name based on token properties and configuration
  const name = getTokenVariableName(token, tokenGroups, collections)

  // Convert token value to object instance, handling references and formatting according to configuration
  const value = getTokenVariableValue(token, mappedTokens, exportConfiguration.useReferences
    //todo
    // Custom handler for token references - converts them to CSS var() syntax
    // tokenToVariableRef: (t) => {
    //   return `var(--${tokenVariableName(t, tokenGroups, collections)})`
    // }
  )
  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  // Add description comment if enabled and description exists
  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}/* ${token.description.trim()} */\n${indentString}val ${name} = ${value};`
  } else {
    return `${indentString}val ${name}: ${value};`
  }
}

//todo extract?
//todo options
function getTokenVariableValue(
  token: Token,
  allTokens: Map<string, Token>,
  allowReferences: boolean
): string {
  //todo remove default value
  /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
  let value: string = ""
  switch (token.tokenType) {
    case TokenType.color:
      value = convertColorToken((token as ColorToken).value, allTokens, allowReferences)
      break
    case TokenType.border:
      // value = this.borderTokenValueToCSS((token as BorderToken).value, allTokens, options)
      break
    case TokenType.gradient:
      // value = this.gradientTokenValueToCSS((token as GradientToken).value, allTokens, options)
      break
    case TokenType.dimension:
    case TokenType.size:
    case TokenType.space:
    case TokenType.opacity:
    case TokenType.fontSize:
    case TokenType.lineHeight:
    case TokenType.letterSpacing:
    case TokenType.paragraphSpacing:
    case TokenType.borderWidth:
    case TokenType.radius:
    case TokenType.duration:
    case TokenType.zIndex:
      // value = this.dimensionTokenValueToCSS((token as AnyDimensionToken).value, allTokens, options)
      break
    case TokenType.shadow:
      // value = this.shadowTokenValueToCSS((token as ShadowToken).value, allTokens, options)
      break
    case TokenType.fontWeight:
      // value = this.fontWeightTokenValueToCSS((token as FontWeightToken).value, allTokens, options)
      break
    case TokenType.fontFamily:
    case TokenType.productCopy:
    case TokenType.string:
      // value = this.stringTokenValueToCSS((token as AnyStringToken).value, allTokens, options)
      break
    case TokenType.textCase:
    case TokenType.textDecoration:
    case TokenType.visibility:
      // value = this.optionTokenValueToCSS((token as AnyOptionToken).value, allTokens, options, token.tokenType)
      break
    case TokenType.blur:
      // value = this.blurTokenValueToCSS((token as BlurToken).value, allTokens, options)
      break
    case TokenType.typography:
      // value = this.typographyTokenValueToCSS((token as TypographyToken).value, allTokens, options)
      break
    default:
      throw new UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:")
  }

  // Allow value transformation if transformer exists
  // if (options.valueTransformer) {
  //   const transformedValue = options.valueTransformer(value, token)
  //   if (transformedValue !== undefined) {
  //     return transformedValue
  //   }
  // }


  return value
}

//todo fix options
//tdoo rem?
function convertColorToken(
  color: ColorTokenValue,
  allTokens: Map<string, Token>,
  allowReferences: boolean
): string {
  const options = {
    colorFormat: ColorFormat.hex8,
    allowReferences: allowReferences,
    //todo decimals
    decimals: 0,
    tokenToVariableRef: (token: Token) => {
      return "TODO"
    }
  }
  return `Color(0x${ColorHelper.formattedColorOrVariableName(color, allTokens, options)})`
}


/**
 * Generates a code-safe variable name for a token based on its properties and configuration.
 * Includes type-specific prefix and considers token hierarchy and collection.
 *
 * @param token - The token to generate a name for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Formatted variable name string
 * @returns Formatted variable name string
 */
export function getTokenVariableName(token: Token, tokenGroups: Array<TokenGroup>, collections: Array<DesignSystemCollection> = []): string {
  const prefix = getTokenPrefix(token.tokenType)
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!

  // Find a collection if needed and exists
  let collection: DesignSystemCollection | null = null
  if (exportConfiguration.tokenNameStructure === TokenNameStructure.CollectionPathAndName && token.collectionId) {
    collection = collections.find((c) => c.persistentId === token.collectionId) ?? ({ name: token.collectionId } as DesignSystemCollection)
  }

  return NamingHelper.codeSafeVariableNameForToken(
    token,
    StringCase.camelCase,
    exportConfiguration.tokenNameStructure !== TokenNameStructure.NameOnly ? parent : null,
    [exportConfiguration.globalNamePrefix, prefix, collection?.name].filter(Boolean).join("")
  )
}
