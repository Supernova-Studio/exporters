import { NamingHelper, CSSHelper } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { formatTokenValue } from "../utils/value-formatter"
import { resetNameTracking } from "../utils/token-hierarchy"

export function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes
    ? exportConfiguration.tokenPrefixes[tokenType]
    : DEFAULT_TOKEN_PREFIXES[tokenType]
}

export function tokenObjectKeyName(token: Token, tokenGroups: Array<TokenGroup>, forExport: boolean = false): string {
  let name = NamingHelper.codeSafeVariableName(
    token.name,
    exportConfiguration.tokenNameStyle
  )

  return name
}

// Use the hierarchy-based name tracking reset
export function resetTokenNameTracking(): void {
  resetNameTracking()
}

export function convertedToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string {
  const name = tokenObjectKeyName(token, tokenGroups)
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    tokenToVariableRef: (t) => {
      return tokenObjectKeyName(t, tokenGroups)
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
