import { Token, TokenGroup } from "@supernovaio/sdk-exporters"
import { NamingHelper } from "./NamingHelper"
import { StringCase } from "../enums/StringCase"

export class TokenNameTracker {
  private tokenNameMap = new Map<string, string>() // token.id -> generated name
  private nameToTokenMap = new Map<string, string>() // generated name -> token.id

  reset(): void {
    this.tokenNameMap.clear()
    this.nameToTokenMap.clear()
  }

  getTokenName(
    token: Token,
    tokenGroups: Array<TokenGroup>,
    format: StringCase,
    prefix: string | null,
    forExport: boolean = false
  ): string {
    // If we're looking up a name for reference and it was already generated, use that
    if (!forExport && this.tokenNameMap.has(token.id)) {
      return this.tokenNameMap.get(token.id)!
    }

    const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
    
    // Get the base name
    let name = NamingHelper.codeSafeVariableNameForToken(token, format, parent, prefix)
    let counter = 1

    // If name is taken by a different token, add a suffix
    while (this.nameToTokenMap.has(name) && this.nameToTokenMap.get(name) !== token.id) {
      name = `${name}${counter++}`
    }

    // Track the name
    if (!forExport) {
      this.tokenNameMap.set(token.id, name)
      this.nameToTokenMap.set(name, token.id)
    }
    
    return name
  }
} 