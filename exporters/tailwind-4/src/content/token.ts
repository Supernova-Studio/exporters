import { NamingHelper, CSSHelper, GeneralHelper } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"

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
 * Applies find/replace rules to a string based on configuration
 * @param input - The string to process
 * @returns The processed string with replacements applied
 */
function applyFindReplace(input: string): string {
  let result = input
  for (const [find, replace] of Object.entries(exportConfiguration.findReplace)) {
    result = result.replace(new RegExp(find, 'g'), replace)
  }
  return result
}

/**
 * Converts a design token into its CSS custom property representation.
 * Handles formatting of the token value, references, and optional description comments.
 * 
 * @param token - The design token to convert
 * @param mappedTokens - Map of all tokens for resolving references
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @returns Formatted CSS custom property string with optional description comment
 */
export function convertedToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string {
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

  // Add debug info showing the full path
  const tokenPath = token.tokenPath || []
  const fullPath = [...tokenPath, token.name].join('/')
  let output = `${indentString}/* Path: ${fullPath} */\n`

  // Add description if enabled
  if (exportConfiguration.showDescriptions && token.description) {
    output += `${indentString}/* ${token.description.trim()} */\n`
  }

  // Special handling for blur tokens
  if (token.tokenType === TokenType.blur) {
    const isBackdropBlur = fullPath.toLowerCase().includes('background')
    name = isBackdropBlur ? 'backdrop-blur' : (token.name.toLowerCase() === 'blur' ? 'blur-default' : `blur-${token.name}`)
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
function tokenVariableName(token: Token, tokenGroups: Array<TokenGroup>): string {
  let prefix = getTokenPrefix(token.tokenType)
  
  // Handle color utility prefixes if enabled and token is a color
  if (exportConfiguration.useColorUtilityPrefixes && token.tokenType === TokenType.color) {
    // Get the parent once and reuse it
    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
    
    // Use the token's built-in path and add token name
    const tokenPath = token.tokenPath || []
    const fullPath = [...tokenPath, token.name].join('/').toLowerCase()

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

        // Construct the name as: utility-color-path-name
        return NamingHelper.codeSafeVariableName(`${utilityName}-color-${cleanName}`, exportConfiguration.tokenNameStyle)
      }
    }

    // If no utility match, use standard naming
    return NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent || null, prefix, exportConfiguration.findReplace)
  }

  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)
  return NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent || null, prefix, exportConfiguration.findReplace)
}
