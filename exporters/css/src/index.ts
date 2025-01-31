import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle } from "../config"
import { indexOutputFile } from "./files/index-file"
import { styleOutputFile } from "./files/style-file"

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
        // Apply all themes directly to token values
        // This mode combines all themes into a single set of tokens
        // Useful when you want to apply multiple themes at once without separate files
        tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const directFiles = [
          ...Object.values(TokenType)
            .map((type) => styleOutputFile(type, tokens, tokenGroups)),
          indexOutputFile(tokens),
        ]
        return processOutputFiles(directFiles)

      case ThemeExportStyle.SeparateFiles:
        // Generate separate files for each theme
        // Creates a new directory for each theme containing all token files
        // Example structure:
        // - base/color.css (base tokens)
        // - dark/color.css (dark theme tokens)
        // - light/color.css (light theme tokens)
        const themeFiles = themesToApply.flatMap((theme) => {
          const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
          return Object.values(TokenType)
            .map((type) => styleOutputFile(
              type, 
              themedTokens, 
              tokenGroups, 
              theme.name.toLowerCase(), 
              theme  // Pass the theme object for override filtering
            ))
        })
        
        // Generate base files without themes
        // These files contain the default token values before any theme is applied
        const baseFiles = Object.values(TokenType)
          .map((type) => styleOutputFile(type, tokens, tokenGroups))

        const separateFiles = [...baseFiles, ...themeFiles, indexOutputFile(tokens, themesToApply)]
        return processOutputFiles(separateFiles)

      case ThemeExportStyle.CombinedTheme:
        // Generate base files without themes
        // These files contain the default token values in the root selector
        // For multi-brand setups, these would be the brand's base tokens
        const baseTokenFiles = Object.values(TokenType)
          .map((type) => styleOutputFile(type, tokens, tokenGroups))

        // Generate themed files with all themes applied
        // Creates a single set of files with all themed tokens
        // All themes are combined into a 'themed' directory
        // Particularly useful for:
        // - Multi-brand setups where each brand has its own themes
        // - When you want to keep brand-specific theme variations together
        // - Scenarios where themes need to be applied on top of brand-specific tokens
        const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const combinedThemeFiles = Object.values(TokenType)
          .map((type) => styleOutputFile(
            type, 
            themedTokens, 
            tokenGroups, 
            'themed',
            themesToApply[0]  // Pass the first theme as reference for overrides
          ))

        const combinedFiles = [...baseTokenFiles, ...combinedThemeFiles, indexOutputFile(tokens, ['themed'])]
        return processOutputFiles(combinedFiles)
    }
  }

  // Default case: Generate files without themes
  const defaultFiles = [
    ...Object.values(TokenType)
      .map((type) => styleOutputFile(type, tokens, tokenGroups)),
    indexOutputFile(tokens),
  ]
  return processOutputFiles(defaultFiles)
})
