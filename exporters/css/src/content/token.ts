import { NamingHelper, CSSHelper } from "@supernova-studio/export-helpers"
import { Token, TokenGroup } from "@supernova-studio/pulsar-next"
import { config } from "../config"

export function convertedToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups)

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: config.useReferences,
    decimals: config.colorPrecision,
    colorFormat: config.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${tokenVariableName(t, tokenGroups)})`
    },
  })
  const indentString = " ".repeat(config.indent)

  if (config.showDescriptions && token.description) {
    // Generate token with comments
    return `${indentString}/* ${token.description.trim()} */\n${indentString}--${name}: ${value};`
  } else {
    // Generate tokens without comments
    return `${indentString}--${name}: ${value};`
  }
}

function tokenVariableName(token: Token, tokenGroups: Array<TokenGroup>): string {
  const prefix = config.tokenPrefixes[token.tokenType]
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
  return NamingHelper.codeSafeVariableNameForToken(token, config.tokenNameStyle, parent, prefix)
}
