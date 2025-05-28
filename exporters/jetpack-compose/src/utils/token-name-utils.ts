import { Token, TokenGroup } from "@supernovaio/sdk-exporters"
import {
  DesignSystemCollection
} from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import { exportConfiguration } from "../index"
import { TokenNameStructure } from "../../config"
import { NamingHelper, StringCase } from "@supernovaio/export-utils"
import { getTokenPrefix } from "../content/token"

/**
 * Generates a code-safe variable name for a token based on its properties and configuration.
 * Includes type-specific prefix and considers token hierarchy and collection.
 *
 * @param token - The token to generate a name for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @param collections - Array of collections for resolving collection names
 * @returns Formatted variable name string
 */
export function tokenName(token: Token, tokenGroups: Array<TokenGroup>, collections: Array<DesignSystemCollection> = []): string {
  //todo makes sense to add prefix of type?
  const prefix = getTokenPrefix(token.tokenType)
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!

  // Find a collection if needed and exists
  let collection: DesignSystemCollection | null = null
  if (exportConfiguration.tokenNameStructure === TokenNameStructure.CollectionPathAndName && token.collectionId) {
    collection = collections.find((c) => c.persistentId === token.collectionId) ?? ({ name: token.collectionId } as DesignSystemCollection)
  }

  return NamingHelper.codeSafeVariableNameForToken(
    token,
    StringCase.camelCase,
    exportConfiguration.tokenNameStructure !== TokenNameStructure.NameOnly ? parent : null,
    [exportConfiguration.globalNamePrefix, prefix, collection?.name].filter(Boolean).join("")
  )
}
