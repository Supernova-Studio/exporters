import { NamingHelper, CSSHelper, TokenNameTracker } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_PREFIXES } from "../constants/defaults"
import { formatTokenValue } from "../utils/value-formatter"

// Create a single instance of the tracker for consistent name generation
export const tokenNameTracker = new TokenNameTracker()

export function getTokenPrefix(tokenType: TokenType): string {
  return exportConfiguration.customizeTokenPrefixes ? exportConfiguration.tokenPrefixes[tokenType] : DEFAULT_TOKEN_PREFIXES[tokenType]
}

export function tokenObjectKeyName(token: Token, tokenGroups: Array<TokenGroup>, forExport: boolean = false): string {
  const prefix = getTokenPrefix(token.tokenType)
  let name = tokenNameTracker.getTokenName(token, tokenGroups, exportConfiguration.tokenNameStyle, prefix, forExport)

  // Apply global prefix if configured
  if (exportConfiguration.globalNamePrefix) {
    name = NamingHelper.codeSafeVariableName(`${exportConfiguration.globalNamePrefix.trim()} ${name}`, exportConfiguration.tokenNameStyle)
  }

  return name
}

// Use the tracker's reset method instead of managing maps directly
export function resetTokenNameTracking(): void {
  tokenNameTracker.reset()
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
