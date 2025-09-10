import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ThemeHelper, StringCase } from "@supernovaio/export-utils"
import { createCatalogRootFile, createPerTokenFile } from "./files/color-sets"

Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Base: Colors.xcassets
  const files: Array<AnyOutputFile> = []
  const baseRoot = `Colors.xcassets`
  files.push(createCatalogRootFile(baseRoot))

  const baseColorTokens = tokens.filter((t) => t.tokenType === TokenType.color)
  
  // Resolve selected themes (if any)
  let themesToApply: Array<TokenTheme> = []
  if (context.themeIds && context.themeIds.length > 0) {
    const themes = await sdk.tokens.getTokenThemes(remoteVersionIdentifier)
    themesToApply = context.themeIds.map((themeId) => {
      const theme = themes.find((t) => t.id === themeId || t.idInVersion === themeId)
      if (!theme) {
        throw new Error(`Unable to find theme ${themeId}`)
      }
      return theme
    })
  }

  // Apply all selected themes at once for a single dark appearance variant
  const themedTokensAll = themesToApply.length > 0
    ? sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
    : []

  // Create a lookup for themed tokens
  const themedById = new Map<string, Token>(themedTokensAll.map((t) => [t.id, t]))

  // For base catalog, add one file per color token with base entry + single dark entry (all themes applied)
  for (const token of baseColorTokens) {
    const singleVariant: Array<Token> = []
    const tv = themedById.get(token.id)
    if (tv) {
      singleVariant.push(tv)
    }
    const file = createPerTokenFile(token, tokenGroups, baseRoot, singleVariant)
    if (file) {
      files.push(file)
    }
  }

  return files
})
