import { Token, TokenGroup } from "@supernova-studio/pulsar-next"
import { config } from "../config"
import { tokenName } from "./token-name"
import { tokenValue } from "./token-value"

export function convertedToken(token: Token, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
  const name = tokenName(token, tokenGroups)
  const value = tokenValue(token, tokens, tokenGroups)
  const indentString = " ".repeat(config.indent)

  if (config.showDescriptions && token.description) {
    // Generate token with comments
    return `/* ${indentString}${token.description}\n${indentString}--${name}: ${value};`
  } else {
    // Generate tokens without comments
    return `${indentString}--${name}: ${value};`
  }
}
