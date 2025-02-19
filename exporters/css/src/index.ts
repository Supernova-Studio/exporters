import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle } from "../config"
import { indexOutputFile } from "./files/index-file"
import { styleOutputFile, generateStyleFiles } from "./files/style-file"
import { ThemeHelper } from "@supernovaio/export-utils"

/** Exporter configuration from the resolved default configuration and user overrides */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Filters out null values from an array of output files
 * @param files Array of output files that may contain null values
 * @returns Array of non-null output files
 */
function processOutputFiles(files: Array<AnyOutputFile | null>): Array<AnyOutputFile> {
    return files.filter((file): file is AnyOutputFile => file !== null);
}

/**
 * Main export function that generates CSS files from design tokens
 * 
 * This function handles:
 * - Fetching tokens and token groups from the design system
 * - Filtering tokens by brand if specified
 * - Processing themes in different modes (direct, separate files, or combined)
 * - Generating style files for each token type
 * - Creating an optional index file that imports all style files
 * 
 * @param sdk - Supernova SDK instance
 * @param context - Export context containing design system information
 * @returns Promise resolving to an array of output files
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch data from design system that is currently being exported
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch tokens and token groups
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
    
    // Handle different theme export modes
    switch (exportConfiguration.exportThemesAs) {
      case 'applyDirectly':
        // Apply all themes directly to token values
        tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const directFiles = [
          ...generateStyleFiles(tokens, tokenGroups, '', undefined, tokenCollections),
          indexOutputFile(tokens),
        ]
        return processOutputFiles(directFiles)

      case 'separateFiles':
        // Generate separate files for each theme
        const themeFiles = themesToApply.flatMap((theme) => {
          const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
          return generateStyleFiles(
            themedTokens, 
            tokenGroups, 
            ThemeHelper.getThemeIdentifier(theme),
            theme,
            tokenCollections
          )
        })
        
        // Generate base files without themes only if exportBaseValues is true
        const baseFiles = exportConfiguration.exportBaseValues
          ? generateStyleFiles(tokens, tokenGroups, '', undefined, tokenCollections)
          : []

        const separateFiles = [...baseFiles, ...themeFiles, indexOutputFile(tokens, themesToApply)]
        return processOutputFiles(separateFiles)

      case 'mergedTheme':
        // Generate base files without themes only if exportBaseValues is true
        const baseTokenFiles = exportConfiguration.exportBaseValues
          ? generateStyleFiles(tokens, tokenGroups, '', undefined, tokenCollections)
          : []

        // Generate themed files with all themes applied
        const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const mergedThemeFiles = generateStyleFiles(
          themedTokens, 
          tokenGroups, 
          'themed',
          themesToApply[0],
          tokenCollections
        )

        const mergedFiles = [...baseTokenFiles, ...mergedThemeFiles, indexOutputFile(tokens, ['themed'])]
        return processOutputFiles(mergedFiles)
    }
  }

  // Default case: Generate files without themes
  const defaultFiles = [
    ...(exportConfiguration.exportBaseValues
      ? generateStyleFiles(tokens, tokenGroups, '', undefined, tokenCollections)
      : []),
    indexOutputFile(tokens),
  ]
  return processOutputFiles(defaultFiles)
})
