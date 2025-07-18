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
 * Analyzes tokens to identify which color tokens need RGB utility versions.
 * A color token needs an RGB utility if it's referenced by shadow, border, or gradient tokens
 * that have custom opacity values.
 * 
 * @param tokens - Array of all tokens
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Set of color token IDs that need RGB utility versions
 */
export function analyzeTokensForRgbUtilities(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = []
): Set<string> {
  const colorTokensNeedingRgb = new Set<string>()
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))

  // Analyze shadow, border, and gradient tokens
  tokens.forEach((token) => {
    if (token.tokenType === TokenType.shadow) {
      const shadowToken = token as any
      shadowToken.value.forEach((shadowLayer: any) => {
        // Check if shadow has custom opacity and references a color token
        if (shadowLayer.opacity && shadowLayer.color.referencedTokenId) {
          const referencedColorToken = mappedTokens.get(shadowLayer.color.referencedTokenId)
          if (referencedColorToken && referencedColorToken.tokenType === TokenType.color) {
            colorTokensNeedingRgb.add(referencedColorToken.id)
          }
        }
      })
    } else if (token.tokenType === TokenType.border) {
      const borderToken = token as any
      // Check if border has custom opacity and references a color token
      if (borderToken.value.opacity && borderToken.value.color.referencedTokenId) {
        const referencedColorToken = mappedTokens.get(borderToken.value.color.referencedTokenId)
        if (referencedColorToken && referencedColorToken.tokenType === TokenType.color) {
          colorTokensNeedingRgb.add(referencedColorToken.id)
        }
      }
    } else if (token.tokenType === TokenType.gradient) {
      const gradientToken = token as any
      gradientToken.value.forEach((gradientLayer: any) => {
        gradientLayer.stops.forEach((stop: any) => {
          // Check if gradient stop has custom opacity and references a color token
          if (stop.opacity && stop.color.referencedTokenId) {
            const referencedColorToken = mappedTokens.get(stop.color.referencedTokenId)
            if (referencedColorToken && referencedColorToken.tokenType === TokenType.color) {
              colorTokensNeedingRgb.add(referencedColorToken.id)
            }
          }
        })
      })
    }
  })

  return colorTokensNeedingRgb
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

/**
 * Converts a color token to its raw RGB values without following references.
 * This is used to generate fallback values for RGB utility variables.
 * 
 * @param token - The color token to convert to RGB values
 * @returns RGB values string (e.g., "16, 79, 198")
 */
export function getColorTokenRgbValue(token: Token): string {
  if (token.tokenType !== TokenType.color) {
    throw new Error(`Expected color token, got ${token.tokenType}`)
  }
  
  const colorValue = (token as any).value
  const r = Math.round(colorValue.color.r)
  const g = Math.round(colorValue.color.g)
  const b = Math.round(colorValue.color.b)
  
  return `${r}, ${g}, ${b}`
}

/**
 * Generates an RGB utility variable for a color token.
 * This creates a CSS variable containing only the RGB values (no alpha) for use with custom opacity.
 * 
 * @param token - The color token to generate RGB utility for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Formatted CSS custom property string for the RGB utility variable
 */
export function generateRgbUtilityVariable(
  token: Token,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = []
): string {
  const name = tokenVariableName(token, tokenGroups, collections)
  const rgbName = `rgb-${name}`
  
  // Extract RGB values from the color token
  const colorValue = (token as any).value
  const r = Math.round(colorValue.color.r)
  const g = Math.round(colorValue.color.g)
  const b = Math.round(colorValue.color.b)
  
  const indentString = GeneralHelper.indent(exportConfiguration.indent)
  
  // Add description comment if enabled and description exists
  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}/* RGB utility for ${token.description.trim()} */\n${indentString}--${rgbName}: ${r}, ${g}, ${b};`
  } else {
    return `${indentString}--${rgbName}: ${r}, ${g}, ${b};`
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
 * @param colorTokensNeedingRgb - Set of color token IDs that need RGB utility versions
 * @returns Formatted CSS custom property string with optional description comment and RGB utilities
 */
export function convertedToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = [],
  colorTokensNeedingRgb?: Set<string>
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
    // When context.needsRgb is true, returns RGB utility variable for color tokens
    // When useFallbackValues is enabled, includes raw token value as fallback
    tokenToVariableRef: (t, context) => {
      const variableName = tokenVariableName(t, tokenGroups, collections)
      
      if (context?.needsRgb && t.tokenType === TokenType.color && colorTokensNeedingRgb?.has(t.id)) {
        if (exportConfiguration.useFallbackValues) {
          const rgbValue = getColorTokenRgbValue(t)
          return `var(--rgb-${variableName}, ${rgbValue})`
        }
        return `var(--rgb-${variableName})`
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
  
  // Generate RGB utility variable if this color token needs one
  if (token.tokenType === TokenType.color && colorTokensNeedingRgb?.has(token.id)) {
    output += `\n${generateRgbUtilityVariable(token, tokenGroups, collections)}`
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
