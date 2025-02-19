import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, Token, TokenGroup, TokenTheme, OutputTextFile } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle } from "../config"
import { styleOutputFile } from "./files/tailwind-file"
import { ThemeHelper } from "@supernovaio/export-utils"

/** Exporter configuration from the resolved default configuration and user overrides */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Filters out null values from an array of output files
 * @param files Array of output files that may contain null values
 * @returns Array of non-null output files
 */
function processOutputFiles(files: Array<OutputTextFile | null>): Array<OutputTextFile> {
    return files.filter((file): file is OutputTextFile => file !== null);
}

/**
 * Main export function that generates Tailwind CSS files from design tokens
 * 
 * This function handles:
 * - Fetching tokens and token groups from the design system
 * - Filtering tokens by brand if specified
 * - Processing themes in different modes (direct, separate files, or combined)
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
      case ThemeExportStyle.ApplyDirectly:
        tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        return processOutputFiles([
          styleOutputFile(tokens, tokenGroups)
        ])

      case ThemeExportStyle.SeparateFiles:
        const themeFiles = themesToApply.flatMap((theme) => {
          const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
          return styleOutputFile(
            themedTokens, 
            tokenGroups, 
            ThemeHelper.getThemeIdentifier(theme),
            theme
          )
        })
        
        const baseFiles = exportConfiguration.exportBaseValues
          ? styleOutputFile(tokens, tokenGroups)
          : null

        return processOutputFiles([baseFiles, ...themeFiles])

      case ThemeExportStyle.MergedTheme:
        const baseTokenFiles = exportConfiguration.exportBaseValues
          ? styleOutputFile(tokens, tokenGroups)
          : null

        const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const mergedThemeFiles = styleOutputFile(
          themedTokens, 
          tokenGroups, 
          'themed',
          themesToApply[0]
        )

        return processOutputFiles([baseTokenFiles, mergedThemeFiles])
    }
  }

  // Default case: Generate files without themes
  return processOutputFiles([
    exportConfiguration.exportBaseValues ? styleOutputFile(tokens, tokenGroups) : null
  ])
})

export function generateFiles(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themes: Array<TokenTheme> = []): Array<OutputTextFile> {
    const files: Array<OutputTextFile> = []

    // Generate the main Tailwind CSS file
    const mainFile = styleOutputFile(tokens, tokenGroups)
    if (mainFile) {
        files.push(mainFile)
    }

    // Generate themed files if needed
    themes.forEach(theme => {
        const themedFile = styleOutputFile(tokens, tokenGroups, ThemeHelper.getThemeIdentifier(theme), theme)
        if (themedFile) {
            files.push(themedFile)
        }
    })

    return files
}
