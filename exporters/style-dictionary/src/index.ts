import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle } from "../config"
import { styleOutputFile } from "./files/style-file"
import { StringCase, ThemeHelper } from "@supernovaio/export-utils"
import { deepMerge } from "./utils/token-hierarchy"

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
    const themesToApply = context.themeIds.map((themeId) => {
      const theme = themes.find((theme) => theme.id === themeId || theme.idInVersion === themeId)
      if (!theme) {
        throw new Error(`Unable to find theme ${themeId}`)
      }
      return theme
    })
    
    // Process themes based on the selected export style
    switch (exportConfiguration.exportThemesAs) {
      case ThemeExportStyle.NestedThemes:
        // Generate one file per token type with all themes nested inside each token
        // Example output at root level:
        // ├── color.json
        // │   {
        // │     "primary": {
        // │       "base": { "value": "#000000" },
        // │       "theme-light": { "value": "#FFFFFF" },
        // │       "theme-dark": { "value": "#333333" },
        // │       "description": "Primary color"
        // │     }
        // │   }
        // ├── typography.json
        // └── ...
        const valueObjectFiles = Object.values(TokenType)
          .map((type) => {
            // First, create a file with base values if enabled
            const baseFile = exportConfiguration.exportBaseValues
              ? styleOutputFile(type, tokens, tokenGroups)
              : null

            // Then create files for each theme
            const themeFiles = themesToApply.map((theme) => {
              const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
              // Pass false for exportBaseValues to prevent including base values in theme files
              const originalExportBaseValues = exportConfiguration.exportBaseValues
              exportConfiguration.exportBaseValues = false
              const file = styleOutputFile(type, themedTokens, tokenGroups, undefined, theme)
              exportConfiguration.exportBaseValues = originalExportBaseValues
              return file
            })

            // Merge all files, starting with the base file
            return [baseFile, ...themeFiles].reduce((merged, file) => {
              if (!file) return merged
              if (!merged) return file

              // Merge the content
              const mergedContent = deepMerge(
                JSON.parse(merged.content),
                JSON.parse(file.content)
              )

              // Return a new file with merged content
              return {
                ...file,
                content: JSON.stringify(mergedContent, null, exportConfiguration.indent)
              }
            }, null)
          })
        return processOutputFiles(valueObjectFiles)

      case ThemeExportStyle.SeparateFiles:
        // Generate separate files for each theme and token type
        // Creates a directory structure like:
        // base/
        //   ├── color.json
        //   └── typography.json
        // light/
        //   ├── color.json
        //   └── typography.json
        // dark/
        //   ├── color.json
        //   └── typography.json
        const themeFiles = themesToApply.flatMap((theme) => {
          const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
          const themePath = ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)
          return Object.values(TokenType)
            .map((type) => styleOutputFile(type, themedTokens, tokenGroups, themePath, theme))
        })
        
        const baseFiles = exportConfiguration.exportBaseValues
          ? Object.values(TokenType)
              .map((type) => styleOutputFile(type, tokens, tokenGroups))
          : []

        return processOutputFiles([
          ...baseFiles, 
          ...themeFiles
        ])

      case ThemeExportStyle.MergedTheme:
        // Generate one file per token type with all themes applied together
        // Useful when themes should be merged in a specific order
        // Creates a directory structure like:
        // base/              (if exportBaseValues is true)
        //   ├── color.json
        //   └── typography.json
        // themed/
        //   ├── color.json   (contains values after applying all themes)
        //   └── typography.json
        const baseTokenFiles = exportConfiguration.exportBaseValues
          ? Object.values(TokenType)
              .map((type) => styleOutputFile(type, tokens, tokenGroups))
          : []

        const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const mergedThemeFiles = Object.values(TokenType)
          .map((type) => styleOutputFile(
            type, 
            themedTokens, 
            tokenGroups, 
            'themed',
            themesToApply[0]
          ))

        const mergedFiles = [
          ...baseTokenFiles, 
          ...mergedThemeFiles
        ]
        return processOutputFiles(mergedFiles)

      case ThemeExportStyle.ApplyDirectly:
        // Apply theme values directly to tokens, replacing base values
        // Generates one set of files at root level:
        // ├── color.json     (contains themed values)
        // ├── typography.json
        // └── ...
        tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        break
    }
  }

  // Default case: Generate files without themes
  const defaultFiles = exportConfiguration.exportBaseValues
    ? Object.values(TokenType)
        .map((type) => styleOutputFile(type, tokens, tokenGroups))
    : []
  
  return processOutputFiles(defaultFiles)
})
