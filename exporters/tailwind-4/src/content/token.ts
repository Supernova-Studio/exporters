import { NamingHelper, CSSHelper, GeneralHelper, StringCase } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
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
  const tokenPath = token.tokenPath || []
  const fullPath = [...tokenPath, token.name].join('/')
  
  // Add debug info only if debug mode is enabled
  if (exportConfiguration.debug) {
    // Add detailed debug information
    output += `${indentString}/* Path: ${fullPath} */\n`
    output += `${indentString}/* Token: ${JSON.stringify({
      name: token.name,
      type: token.tokenType,
      path: token.tokenPath,
      prefix: getTokenPrefix(token.tokenType)
    })} */\n`
  }

  // Add description if enabled
  if (exportConfiguration.showDescriptions && token.description) {
    output += `${indentString}/* ${token.description.trim()} */\n`
  }

  // Special handling for blur tokens
  if (token.tokenType === TokenType.blur) {
    const isBackdropBlur = fullPath.toLowerCase().includes('background')
    const blurName = isBackdropBlur ? 'backdrop-blur' : (token.name.toLowerCase() === 'blur' ? 'blur-default' : `blur-${token.name}`)
    name = NamingHelper.codeSafeVariableName(blurName, StringCase.kebabCase)
  }
  
  output += `${indentString}--${name}: ${value};`
  return output
}

/**
 * Builds a complete path by traversing up through parent groups
 */
function buildFullPath(groupId: string | null, tokenGroups: Array<TokenGroup>): string[] {
  const path: string[] = []
  let currentGroupId = groupId

  while (currentGroupId) {
    const group = tokenGroups.find(g => g.id === currentGroupId)
    if (!group) break

    path.unshift(group.name)
    currentGroupId = group.parentGroupId
  }

  return path
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
  
  // Debug logging if debug mode is enabled
  if (exportConfiguration.debug) {
    console.log('Token:', {
      name: token.name,
      type: token.tokenType,
      path: token.tokenPath,
      prefix,
      findReplace: exportConfiguration.findReplace
    })
  }
  
  // Handle color utility prefixes if enabled and token is a color
  if (exportConfiguration.useColorUtilityPrefixes && token.tokenType === TokenType.color) {
    // Get the parent once and reuse it
    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
    
    // Use the token's built-in path and add token name
    const tokenPath = token.tokenPath || []
    const fullPath = [...tokenPath, token.name].join('/').toLowerCase()

    // Debug logging for color token paths if debug mode is enabled
    if (exportConfiguration.debug) {
      console.log('Color token path:', {
        tokenPath,
        fullPath,
        findReplace: exportConfiguration.findReplace
      })
    }

    // Check token path against each utility pattern
    for (const [utilityName, pattern] of Object.entries(exportConfiguration.colorUtilityPrefixes)) {
      if (fullPath.includes(pattern.toLowerCase())) {
        // Find where the pattern matches in the path
        const patternIndex = tokenPath.findIndex(p => p.toLowerCase() === pattern.toLowerCase())
        
        // Get the remaining path segments after the pattern match
        const remainingPath = patternIndex >= 0 
          ? tokenPath.slice(patternIndex + 1)
          : tokenPath

        // Combine remaining path with token name
        const segments = [...remainingPath, token.name]
        const cleanName = segments.join('-').toLowerCase()
          .trim()
          .replace(/^[-\s]+|[-\s]+$/g, '') // Remove leading/trailing hyphens and spaces

        // Debug logging for utility matches if debug mode is enabled
        if (exportConfiguration.debug) {
          console.log('Color utility match:', {
            utilityName,
            pattern,
            remainingPath,
            segments,
            cleanName
          })
        }

        // Construct the name as: utility-color-path-name
        // Using only codeSafeVariableName because we
        return NamingHelper.codeSafeVariableName(`${utilityName}-color-${cleanName}`, StringCase.kebabCase, exportConfiguration.findReplace)
      }
    }

    // If no utility match, use standard naming
    const name = NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, parent || null, prefix, exportConfiguration.findReplace)
    
    // Debug logging for standard naming if debug mode is enabled
    if (exportConfiguration.debug) {
      console.log('Standard color naming:', {
        name,
        token,
        parent,
        prefix,
        findReplace: exportConfiguration.findReplace
      })
    }
    
    return name
  }

  // For non-color tokens or when color utility prefixes are disabled
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
  const name = NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, parent || null, prefix, exportConfiguration.findReplace)
  
  // Debug logging for non-color tokens if debug mode is enabled
  if (exportConfiguration.debug) {
    console.log('Non-color token naming:', {
      name,
      token,
      parent,
      prefix,
      findReplace: exportConfiguration.findReplace
    })
  }
  
  return name
}
