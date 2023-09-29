import { NamingHelper, StringCase } from "@supernova-studio/export-helpers"
import { Token, TokenGroup } from "@supernova-studio/pulsar-next"
import { config } from "../config"
import { tokenValue } from "./token-value"

export function convertedToken(token: Token, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
  const tokenParent = tokenGroups.find((group) => group.id === token.parentGroupId)!

  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const prefix = config.tokenPrefixes[token.tokenType]
  const name = NamingHelper.codeSafeVariableNameForToken(token, config.tokenNameStyle, tokenParent, prefix)

  // Then creating the value of the token, using another helper function
  const value = tokenValue(token, tokens, tokenGroups)
  const indentString = " ".repeat(config.indent)

  if (config.showDescriptions && token.description) {
    // Generate token with comments
    return `${indentString}/* ${token.description.trim()} */\n${indentString}--${name}: ${value};`
  } else {
    // Generate tokens without comments
    return `${indentString}--${name}: ${value};`
  }
}
//
