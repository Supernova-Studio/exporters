import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ThemeHelper, StringCase } from "@supernovaio/export-utils"
import { createCatalogRootFile, createPerTokenFile } from "./files/color-sets"

/**
 * Xcode Color Set Exporter (Proof of Concept)
 *
 * What this exporter does:
 * - Reads color tokens from the current design system version
 * - Optionally applies all selected themes at once to compute one themed value per token
 * - Generates an Xcode asset catalog with one color set per color token
 * - Each color set file (Contents.json) is an array with:
 *   - One base entry (universal)
 *   - One themed entry marked as { appearances: [{ appearance: "luminosity", value: "dark" }] }
 *
 * Why arrays and not the usual Xcode wrapper object?
 * - The PoC follows the user-provided format (raw array of entries) for each token file.
 *
 * Key SDK concepts used:
 * - Pulsar.export(fn): Registers the main async export function
 * - Supernova SDK (sdk): Provides access to tokens, groups and theme application
 * - PulsarContext (context): Identifies which design system/version/themes are being exported
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Identify which design system + version we are exporting from
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch tokens and token groups from the selected design system version
  // - tokens: all tokens (we will filter to colors only)
  // - tokenGroups: used for generating stable, unique names
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Prepare output files and ensure the required Xcode catalog root exists
  const files: Array<AnyOutputFile> = []
  const baseRoot = `Colors.xcassets`
  files.push(createCatalogRootFile(baseRoot))

  // Only color tokens are relevant for Xcode color sets
  const baseColorTokens = tokens.filter((t) => t.tokenType === TokenType.color)
  
  // Resolve selected themes (if any). We don't distinguish dark/light by name here.
  // We will apply ALL selected themes at once to produce a single themed value.
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

  // Compute a single themed set by applying all selected themes in order.
  // This returns the full token list, with each token's value resolved as if all
  // themes were applied. We'll later pick the themed value for each color token by ID.
  const themedTokensAll = themesToApply.length > 0
    ? sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
    : []

  // Quick lookup by token ID → themed token
  const themedById = new Map<string, Token>(themedTokensAll.map((t) => [t.id, t]))

  // For each color token, emit one file containing:
  // - Base value (universal)
  // - Single themed value as dark appearance (if themes were selected)
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

  // Return all files to the export engine for writing to the destination
  return files
})
