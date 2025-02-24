import { NamingHelper, CSSHelper } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { formatTokenValue } from "../utils/value-formatter"
import { resetNameTracking } from "../utils/token-hierarchy"
import { DesignSystemCollection } from '@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection'

export function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes
    ? exportConfiguration.tokenPrefixes[tokenType]
    : DEFAULT_TOKEN_PREFIXES[tokenType]
}

export function tokenObjectKeyName(
  token: Token, 
  tokenGroups: Array<TokenGroup>, 
  forExport: boolean = false,
  collections: Array<DesignSystemCollection> = []
): string {
  // Find collection if needed and exists
  let collection: DesignSystemCollection | null = null
  if (exportConfiguration.tokenNameStructure === 'collectionPathAndName' && token.collectionId) {
    collection = collections.find(c => c.persistentId === token.collectionId) ?? {name: token.collectionId} as DesignSystemCollection
  }

  // For nameOnly structure, don't pass the parent group
  const parentGroup = exportConfiguration.tokenNameStructure !== 'nameOnly' ? 
    tokenGroups.find((group) => group.id === token.parentGroupId) : 
    null

  // Ensure parent is either a valid TokenGroup or null
  const parent = parentGroup ?? null

  // Get the prefix for this token type
  const prefix = getTokenPrefix(token.tokenType)

  return NamingHelper.codeSafeVariableNameForToken(
    token,
    exportConfiguration.tokenNameStyle,
    parent,
    prefix,
    collection?.name,
    exportConfiguration.globalNamePrefix
  )
}

// Use the hierarchy-based name tracking reset
export function resetTokenNameTracking(): void {
  resetNameTracking()
}

export function convertedToken(
  token: Token, 
  mappedTokens: Map<string, Token>, 
  tokenGroups: Array<TokenGroup>,
  collections: Array<DesignSystemCollection> = []
): string {
  const name = tokenObjectKeyName(token, tokenGroups, false, collections)
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    tokenToVariableRef: (t) => {
      return tokenObjectKeyName(t, tokenGroups, false, collections)
    },
  })

  const indentString = " ".repeat(exportConfiguration.indent)
  const formattedValue = formatTokenValue(value)

  if (exportConfiguration.showDescriptions && token.description) {
    return `${indentString}// ${token.description.trim()}\n${indentString}${name}: ${formattedValue},`
  } else {
    return `${indentString}${name}: ${formattedValue},`
  }
}
