import { NamingHelper, CSSHelper, StringCase } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"

// Maps to track token name generation to ensure uniqueness and consistency:
// - tokenNameMap: Caches generated names to ensure the same token always gets the same name
// - nameToTokenMap: Ensures uniqueness by tracking which names are already taken
const tokenNameMap = new Map<string, string>() // token.id -> generated name
const nameToTokenMap = new Map<string, string>() // generated name -> token.id

export function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes
    ? exportConfiguration.tokenPrefixes[tokenType]
    : DEFAULT_TOKEN_PREFIXES[tokenType]
}

export function tokenObjectKeyName(token: Token, tokenGroups: Array<TokenGroup>, forExport: boolean = false): string {
  // For non-export cases, return cached name if available to maintain consistency
  if (!forExport && tokenNameMap.has(token.id)) {
    return tokenNameMap.get(token.id)!
  }

  const prefix = getTokenPrefix(token.tokenType)
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
  
  // Generate a safe variable name using the token's properties and parent group
  let name = NamingHelper.codeSafeVariableNameForToken(token, StringCase.camelCase, parent, prefix)
  let counter = 1

  // Handle name collisions by appending numbers until we find a unique name
  // that isn't already used by a different token
  while (nameToTokenMap.has(name) && nameToTokenMap.get(name) !== token.id) {
    name = `${name}${counter++}`
  }

  // Cache the generated name for future lookups, but only if not generating for export
  // This prevents temporary names used during export from polluting the name cache
  if (!forExport) {
    tokenNameMap.set(token.id, name)
    nameToTokenMap.set(name, token.id)
  }
  
  return name
}

// Clears the name tracking maps, useful when starting a new generation session
// to prevent names from previous generations affecting new ones
export function resetTokenNameTracking(): void {
  tokenNameMap.clear()
  nameToTokenMap.clear()
}

export function convertedToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string {
  // Generate a consistent, unique name for this token
  const name = tokenObjectKeyName(token, tokenGroups)

  // Convert the token's value to a CSS-compatible format, handling references and formatting
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    tokenToVariableRef: (t) => {
      // Convert referenced tokens to their variable names
      return tokenObjectKeyName(t, tokenGroups)
    },
  })

  // Format the value based on its type:
  // - CSS values (with units or color hex) are wrapped in quotes
  // - References to other tokens are left as direct object references
  const formattedValue = value.includes('px') || value.includes('rem') || value.includes('%') || value.includes('#')
    ? `"${value}"` 
    : value

  const indentString = " ".repeat(exportConfiguration.indent)

  // Include the token's description as a comment if enabled and available
  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}// ${token.description.trim()}\n${indentString}${name}: ${formattedValue},`
  } else {
    return `${indentString}${name}: ${formattedValue},`
  }
}

function tokenVariableName(token: Token, tokenGroups: Array<TokenGroup>): string {
  const prefix = getTokenPrefix(token.tokenType)
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
  return NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix)
}

function addGlobalPrefix(name: string): string {
  if (!exportConfiguration.globalNamePrefix) {
    return name
  }
  // Format the global prefix and combine with name using the same NamingHelper
  return NamingHelper.codeSafeVariableName(
    `${exportConfiguration.globalNamePrefix.trim()} ${name}`,
    exportConfiguration.tokenNameStyle
  )
}
