import { AnyOutputFile, PulsarContext, RemoteVersionIdentifier, Supernova } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import { generateObjectFiles } from "./files/object-file"
import { WriteTokenPropStore } from "@supernovaio/export-utils"
import { tokenPropertyName } from "./content/token"
import { indexFiles } from "./files/index-file"

/** Exporter configuration from the resolved default configuration and user overrides */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Main export function that generates Kotlin files from design tokens
 *
 * This function handles:
 * - Fetching tokens and token groups from the design system
 * - Filtering tokens by brand if specified
 * - Processing themes in different modes (direct, separate files, or combined)
 * - Generating files for each token type
 * - Creating optional index files that expose all token files
 *
 * @param sdk - Supernova SDK instance
 * @param context - Export context containing design system information
 * @returns Promise resolving to an array of output files
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch data from the design system that is currently being exported
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId
  }

  // Fetch tokens and token groups
  let outputFiles: Array<AnyOutputFile> = []
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)
  let tokenCollections = await sdk.tokens.getTokenCollections(remoteVersionIdentifier)

  // Filter by brand if specified
  if (context.brandId) {
    const brands = await sdk.brands.getBrands(remoteVersionIdentifier)
    const brand = brands.find((brand) => brand.id === context.brandId || brand.idInVersion === context.brandId)
    if (!brand) {
      throw new Error(`Unable to find brand ${context.brandId}.`)
    }

    tokens = tokens.filter((token) => token.brandId === brand.id)
    tokenGroups = tokenGroups.filter((tokenGroup) => tokenGroup.brandId === brand.id)
  }

  // Process themes if specified
  if (context.themeIds && context.themeIds.length > 0) {
    const themes = await sdk.tokens.getTokenThemes(remoteVersionIdentifier)

    // Find and validate requested themes
    const themesToApply = context.themeIds.map((themeId) => {
      const theme = themes.find((theme) => theme.id === themeId || theme.idInVersion === themeId)
      if (!theme) {
        throw new Error(`Unable to find theme ${themeId}.`)
      }
      return theme
    })

    // Generate separate files for each theme
    const themeFiles = themesToApply.flatMap((theme) => {
      const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
      return generateObjectFiles(themedTokens, tokenGroups, theme, tokenCollections)
    })

    // Generate base files without themes only if exportBaseValues is true
    const baseFiles = exportConfiguration.exportBaseValues
      ? generateObjectFiles(tokens, tokenGroups, undefined, tokenCollections)
      : []

    outputFiles = [...baseFiles, ...themeFiles, ...indexFiles(tokens, themesToApply)]
  } else {
    // Default case: Generate files without themes
    outputFiles = [
      ...(exportConfiguration.exportBaseValues
        ? generateObjectFiles(tokens, tokenGroups, undefined, tokenCollections)
        : []),
      ...indexFiles(tokens, undefined)
    ]
  }

  // Write the property name of each token if it is enabled in the settings
  if (!context.isPreview && exportConfiguration.writeNameToProperty) {
    const writeStore = new WriteTokenPropStore(sdk, remoteVersionIdentifier)
    await writeStore.writeTokenProperties(exportConfiguration.propertyToWriteNameTo, tokens, (token) => {
      return tokenPropertyName(token, tokenGroups, tokenCollections)
    })
  }

  // Finalize export by retrieving the files to write to destination
  return outputFiles
})
