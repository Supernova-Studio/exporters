import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ThemeHelper, StringCase, TokenNameTracker, WriteTokenPropStore, NamingHelper } from "@supernovaio/export-utils"
import { createCatalogRootFile, createPerTokenFile } from "./files/color-sets"
import { ExporterConfiguration } from "../config"

/**
 * Xcode Color Set Exporter (Proof of Concept)
 *
 * What this exporter does:
 * - Reads color tokens from the current design system version
 * - Optionally applies selected themes to compute themed values per token
 * - Generates an Xcode asset catalog with one color set per color token
 * - Each color set file (Contents.json) is an array with:
 *   - One base entry (universal)
 *   - One themed entry marked as { appearances: [{ appearance: "luminosity", value: "dark" }] }
 *
 * Theme application rules (per request):
 * - If there is only 1 selected theme: apply it as dark appearance (single themed entry)
 * - If there are 2+ selected themes: apply the FIRST theme to the base value and the SECOND theme
 *   as dark appearance; ignore any other themes
 *
 * Output location options:
 * - generateRootCatalog (boolean): when true, create the root catalog folder and its Contents.json
 * - rootCatalogPath (string): root path for the catalog; can include "/" to create nested folders
 */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Identify which design system + version we are exporting from
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch tokens and token groups from the selected design system version
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Only color tokens are relevant for Xcode color sets
  const colorTokens = tokens.filter((t) => t.tokenType === TokenType.color)

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

  // Prepare output files and, depending on configuration, prepare root path/file
  const files: Array<AnyOutputFile> = []
  const rootPath = exportConfiguration.generateRootCatalog ? (exportConfiguration.rootCatalogPath || "Colors.xcassets") : ""
  if (exportConfiguration.generateRootCatalog) {
    files.push(createCatalogRootFile(rootPath))
  }

  // Theme application strategy
  // - 0 themes: base only
  // - 1 theme: base + dark (apply that one theme)
  // - 2+ themes: base is computed by applying the FIRST theme; dark is computed by applying the SECOND theme
  let baseTokens: Array<Token> = tokens
  let darkTokens: Array<Token> = []

  if (themesToApply.length === 1) {
    // Base stays as original tokens; dark is tokens with the single theme applied
    darkTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [themesToApply[0]])
  } else if (themesToApply.length >= 2) {
    // Base becomes FIRST theme applied; dark becomes SECOND theme applied
    baseTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [themesToApply[0]])
    darkTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [themesToApply[1]])
  }

  // Create lookup maps by token id for base and dark values
  const baseById = new Map<string, Token>(baseTokens.map((t) => [t.id, t]))
  const darkById = new Map<string, Token>(darkTokens.map((t) => [t.id, t]))

  // Use tracker + configured style for folder naming
  const tracker = new TokenNameTracker()
  const nameStyle = exportConfiguration.folderNameStyle || StringCase.kebabCase

  // Emit one file per color token according to rules above
  for (const token of colorTokens) {
    const baseToken = baseById.get(token.id) || token
    const darkVariant = darkById.get(token.id)
    const variants = darkVariant ? [darkVariant] : []
    const file = createPerTokenFile(baseToken, tokenGroups, rootPath, variants, tracker, nameStyle)
    if (file) {
      files.push(file)
    }
  }

  // Optional write-back of folder names to tokens as a custom property
  if (exportConfiguration.writeNameToProperty && !(context as any).isPreview) {
    const writeStore = new WriteTokenPropStore(sdk, remoteVersionIdentifier)
    await writeStore.writeTokenProperties(exportConfiguration.propertyToWriteNameTo, colorTokens, (t) => {
      // Use tracker+style to mirror exported folder names
      const name = tracker.getTokenName(t, tokenGroups, nameStyle, null, true)
      return NamingHelper.codeSafeVariableName(name, nameStyle)
    })
  }

  // Return all files to the export engine for writing to the destination
  return files
})
