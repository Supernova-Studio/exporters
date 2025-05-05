import { NamingHelper, CSSHelper, GeneralHelper, StringCase } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType, TypographyTokenValue, FontSizeTokenValue, LineHeightTokenValue, LetterSpacingTokenValue, FontWeightTokenValue, TypographyToken, AnyDimensionTokenValue, AnyTokenValue, AnyToken } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { TAILWIND_TOKEN_PREFIXES, TAILWIND_ALLOWED_CUSTOMIZATION } from "../constants/defaults"

/**
 * Gets the prefix for a specific token type based on configuration.
 * Uses either custom prefixes from configuration or default prefixes.
 * @param tokenType - The type of token (e.g., color, typography, etc.)
 * @returns The prefix string to use for this token type
 */
export function getTokenPrefix(tokenType: TokenType): string {
  return TAILWIND_TOKEN_PREFIXES[tokenType]
}

/**
 * Check if a token type is allowed for customization in Tailwind
 * @param tokenType The token type to check
 * @returns True if the token type is allowed in Tailwind customization
 */
export function isAllowedTokenType(tokenType: TokenType): boolean {
  return TAILWIND_ALLOWED_CUSTOMIZATION.includes(tokenType)
}

/**
 * Generates debug information for a token
 * @param token - The token to generate debug info for
 * @param indentString - The indentation string to use
 * @returns Debug information string or empty string if debug is disabled
 */
function generateDebugInfo(token: Token, indentString: string): string {
  if (!exportConfiguration.debug) {
    return ""
  }

  const tokenPath = token.tokenPath || []
  const fullPath = [...tokenPath, token.name].join('/')
  
  return `${indentString}/* Path: ${fullPath} */\n` +
         `${indentString}/* Token: ${JSON.stringify({
           name: token.name,
           id: token.id,
           type: token.tokenType,
           path: token.tokenPath,
           prefix: getTokenPrefix(token.tokenType),
           value: (token as unknown as AnyToken).value
         })} */\n`
}

/**
 * Handles the conversion of a typography token into CSS custom properties
 * @param token - The typography token to convert
 * @param mappedTokens - Map of all tokens for resolving references
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @returns Formatted CSS custom property string
 */
function handleTypographyToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string {
  const indentString = GeneralHelper.indent(exportConfiguration.indent)
  let output = ""
  
  // Add debug info
  output += generateDebugInfo(token, indentString)

  // Add description if enabled
  if (exportConfiguration.showDescriptions && token.description) {
    output += `${indentString}/* ${token.description.trim()} */\n`
  }

  // Get the base name for the typography token
  const baseName = tokenVariableName(token, tokenGroups)

  // Extract individual properties from the typography token
  // @ts-ignore
  const typographyValue = token.value as TypographyTokenValue

  // Helper function to create CSS variable for a typography property
  const createTypographyProperty = (property: keyof Omit<TypographyTokenValue, 'referencedTokenId'>, suffix: string = '') => {
    if (typographyValue[property]) {
      const propertyValue = typographyValue[property] as AnyDimensionTokenValue
      const value = {
        ...propertyValue,
        referencedTokenId: propertyValue.referencedTokenId || null
      }

      // Map typography properties to their corresponding token types
      const tokenTypeMap: Record<keyof Omit<TypographyTokenValue, 'referencedTokenId'>, TokenType> = {
        fontSize: TokenType.fontSize,
        lineHeight: TokenType.lineHeight,
        letterSpacing: TokenType.letterSpacing,
        fontWeight: TokenType.fontWeight,
        fontFamily: TokenType.fontFamily,
        textDecoration: TokenType.textDecoration,
        textCase: TokenType.textCase,
        paragraphIndent: TokenType.paragraphSpacing,
        paragraphSpacing: TokenType.paragraphSpacing
      }

      // @ts-ignore
      output += `${indentString}--${baseName}${suffix}: ${CSSHelper.tokenToCSS({ ...token, value, tokenType: tokenTypeMap[property] }, mappedTokens, {
        allowReferences: exportConfiguration.useReferences,
        decimals: exportConfiguration.colorPrecision,
        colorFormat: exportConfiguration.colorFormat,
        forceRemUnit: exportConfiguration.forceRemUnit,
        remBase: exportConfiguration.remBase,
        tokenToVariableRef: (t) => `var(--${tokenVariableName(t, tokenGroups)})`
      })};\n`
    }
  }

  // Create CSS variables for each typography property
  createTypographyProperty('fontSize') // Base font size
  createTypographyProperty('lineHeight', '--line-height')
  createTypographyProperty('letterSpacing', '--letter-spacing')
  createTypographyProperty('fontWeight', '--font-weight')

  return output
}

/**
 * Converts a design token into its CSS custom property representation.
 * Handles formatting of the token value, references, and optional description comments.
 * 
 * @param token - The design token to convert
 * @param mappedTokens - Map of all tokens for resolving references
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @returns Formatted CSS custom property string with optional description comment or null if token type is not allowed
 */
export function convertedToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string | null {
  // Skip tokens that are not allowed for Tailwind customization
  if (!isAllowedTokenType(token.tokenType)) {
    return null;
  }

  // Special handling for typography tokens
  if (token.tokenType === TokenType.typography) {
    return handleTypographyToken(token, mappedTokens, tokenGroups)
  }

  // Generate the CSS variable name based on token properties and configuration
  let name = tokenVariableName(token, tokenGroups)

  // Convert token value to CSS, handling references and formatting according to configuration
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    // Custom handler for token references - converts them to CSS var() syntax
    tokenToVariableRef: (t) => {
      // Skip references to tokens that are not allowed for Tailwind customization
      if (!isAllowedTokenType(t.tokenType)) {
        // Return the raw value instead of a reference
        return CSSHelper.tokenToCSS(t, mappedTokens, {
          allowReferences: false, // Don't follow nested references
          decimals: exportConfiguration.colorPrecision,
          colorFormat: exportConfiguration.colorFormat,
          forceRemUnit: exportConfiguration.forceRemUnit,
          remBase: exportConfiguration.remBase,
          tokenToVariableRef: () => "", // Stub function that never gets called since allowReferences is false
          valueTransformer: undefined
        });
      }
      return `var(--${tokenVariableName(t, tokenGroups)})`
    },
    // Handle blur values - extract just the dimension
    valueTransformer: (value: string, t: Token) => {
      if (t.tokenType === TokenType.blur) {
        // For blur(12px) -> extract 12px
        const match = value.match(/^blur\((.*)\)$/)
        if (match) {
          return match[1]
        }
        // For direct values (background blur) just return as is
        return value
      }
      return undefined
    }
  })
  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  let output = ""
  
  // Add debug info
  output += generateDebugInfo(token, indentString)

  // Add description if enabled
  if (exportConfiguration.showDescriptions && token.description) {
    output += `${indentString}/* ${token.description.trim()} */\n`
  }

  // Special handling for blur tokens
  if (token.tokenType === TokenType.blur) {
    const tokenPath = token.tokenPath || []
    const fullPath = [...tokenPath, token.name].join('/').toLowerCase()
    const isBackdropBlur = fullPath.includes('background')
    const blurName = isBackdropBlur ? 'backdrop-blur' : (token.name.toLowerCase() === 'blur' ? 'blur-default' : `blur-${token.name}`)
    name = NamingHelper.codeSafeVariableName(blurName, StringCase.kebabCase)
  }
  
  output += `${indentString}--${name}: ${value};`
  return output
}

/**
 * Normalizes a name for Tailwind usage by ensuring it has at least one hyphen
 * by appending "-default" if it's a single word, so it doesn't result in a class name like ".text", ".text-color", ".border", etc.
 * @param name The name to normalize
 * @returns The normalized name with "-default" appended if it was a single word
 */
function normalizeForTailwindConfig(name: string): string {
    if (!name.includes('-') 
      || name === "text-color" 
      || name === "background-color" 
      || name === "border-color"
      || name === "box-shadow-color"
      || name === "outline-color"
      || name === "stroke-color"
      || name === "fill-color"
      || name === "ring-color"
      ) {
        return `${name}-default`;
    }
    return name;
}

/**
 * Checks if a token path matches a color utility pattern, considering both positive and negative patterns.
 * @param fullPath The full token path to check
 * @param patternString The pattern string containing comma-separated patterns, with optional ! prefix for negation
 * @returns An object containing whether the path matches and the first matching positive pattern
 */
function matchColorUtilityPattern(fullPath: string, patternString: string): { matches: boolean; matchingPattern: string } {
  // Split pattern by comma to support multiple patterns for a single utility
  const patterns = patternString.split(',').map(p => p.trim().toLowerCase())
  
  // Separate positive and negative patterns
  const positivePatterns = patterns.filter(p => !p.startsWith('!'))
  const negativePatterns = patterns.filter(p => p.startsWith('!')).map(p => p.slice(1))
  
  // Check if the path matches any positive pattern
  const matchesPositive = positivePatterns.some(pattern => fullPath.includes(pattern))
  
  // Check if the path matches any negative pattern
  const matchesNegative = negativePatterns.some(pattern => fullPath.includes(pattern))
  
  // A match occurs if it matches at least one positive pattern AND doesn't match any negative patterns
  const matches = matchesPositive && !matchesNegative
  
  // Find the first matching positive pattern
  const matchingPattern = matches ? (positivePatterns.find(pattern => fullPath.includes(pattern)) || '') : ''
  
  return { matches, matchingPattern }
}

/**
 * Generates a code-safe variable name for a token based on its properties and configuration.
 * Includes type-specific prefix and considers token hierarchy.
 * 
 * @param token - The token to generate a name for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @returns Formatted variable name string
 */
export function tokenVariableName(token: Token, tokenGroups: Array<TokenGroup>): string {
  let prefix = getTokenPrefix(token.tokenType)
  
  // Handle color utility prefixes if enabled and token is a color
  if (exportConfiguration.useColorUtilityPrefixes && token.tokenType === TokenType.color) {
    // Get the parent once and reuse it
    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
    
    // Use the token's built-in path and add token name
    const tokenPath = token.tokenPath || []
    const fullPath = [...tokenPath, token.name].join('/').toLowerCase()

    // Check token path against each utility pattern
    for (const [utilityName, patternString] of Object.entries(exportConfiguration.colorUtilityPrefixes)) {
      const { matches, matchingPattern } = matchColorUtilityPattern(fullPath, patternString)
      
      if (matches) {
        const patternIndex = tokenPath.findIndex(p => p.toLowerCase().includes(matchingPattern))
        
        // Get the remaining path segments after the pattern match
        const remainingPath = patternIndex >= 0 
          ? tokenPath.slice(patternIndex + 1)
          : tokenPath

        // Combine remaining path with token name
        const segments = [...remainingPath, token.name]
        const cleanName = segments.join('-').toLowerCase()
          .trim()
          .replace(/^[-\s]+|[-\s]+$/g, '') // Remove leading/trailing hyphens and spaces

        // Construct the name as: utility-color-path-name
        // We also remove the utility name from the cleanName to avoid redundancy
        let name = NamingHelper.codeSafeVariableName(`${utilityName}-color-${cleanName.replace(utilityName, '')}`, StringCase.kebabCase, exportConfiguration.findReplace, true)

        return normalizeForTailwindConfig(name);
      }
    }

    // If no utility match, use standard naming
    const name = NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, parent || null, prefix, exportConfiguration.findReplace)
    return normalizeForTailwindConfig(name);
  }

  // For non-color tokens or when color utility prefixes are disabled
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
  const name = NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, parent || null, prefix, exportConfiguration.findReplace)
  return normalizeForTailwindConfig(name);
}
