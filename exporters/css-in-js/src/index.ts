import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle } from "../config"
import { indexOutputFile } from "./files/index-file"
import { styleOutputFile } from "./files/style-file"
import { typesOutputFile } from "./files/types-file"
import { folderIndexOutputFile } from "./files/folder-index-file"
import { StringCase, ThemeHelper, WriteTokenPropStore } from "@supernovaio/export-utils"
import { tokenObjectKeyName } from "./content/token"

/** Exporter configuration from the resolved default configuration and user overrides */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Filters out null values from an array of output files
 * @param files Array of output files that may contain null values
 * @returns Array of non-null output files
 */
function processOutputFiles(files: Array<AnyOutputFile | null>): Array<AnyOutputFile> {
  return files.filter((file): file is AnyOutputFile => file !== null)
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
  let outputFiles: Array<AnyOutputFile> = []
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
        throw new Error(`Unable to find theme ${themeId}`)
      }
      return theme
    })

    switch (exportConfiguration.exportThemesAs) {
      case ThemeExportStyle.SeparateFiles:
        const themeFiles = themesToApply.flatMap((theme) => {
          const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
          const themePath = ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)
          const files = Object.values(TokenType).map((type) => styleOutputFile(type, themedTokens, tokenGroups, themePath, theme))

          // Generate folder index files independently of root index file
          if (exportConfiguration.generateFolderIndexFiles) {
            files.push(folderIndexOutputFile(themedTokens, themePath))
          }

          return files
        })

        const baseFiles = exportConfiguration.exportBaseValues
          ? [
              ...Object.values(TokenType).map((type) => styleOutputFile(type, tokens, tokenGroups)),
              ...(exportConfiguration.generateFolderIndexFiles
                ? [folderIndexOutputFile(tokens, exportConfiguration.baseStyleFilePath)]
                : []),
            ]
          : []

        // Only add root index file if enabled
        const rootIndexFile = exportConfiguration.generateIndexFile ? [indexOutputFile(tokens, themesToApply)] : []

        const separateFiles = [
          ...baseFiles,
          ...themeFiles,
          ...rootIndexFile,
          ...(exportConfiguration.generateTypeDefinitions ? [typesOutputFile(tokens, tokenGroups)] : []),
        ]
        outputFiles = processOutputFiles(separateFiles)
        break

      case ThemeExportStyle.MergedTheme:
        const baseTokenFiles = exportConfiguration.exportBaseValues
          ? Object.values(TokenType).map((type) => styleOutputFile(type, tokens, tokenGroups))
          : []

        const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        const mergedThemeFiles = Object.values(TokenType).map((type) =>
          styleOutputFile(type, themedTokens, tokenGroups, "themed", themesToApply[0])
        )

        const mergedFiles = [
          ...baseTokenFiles,
          ...mergedThemeFiles,
          indexOutputFile(tokens, ["themed"]),
          ...(exportConfiguration.generateTypeDefinitions ? [typesOutputFile(tokens, tokenGroups)] : []),
        ]
        outputFiles = processOutputFiles(mergedFiles)
        break

      case ThemeExportStyle.ApplyDirectly:
        // Apply themes directly to tokens
        tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        break
    }
  } else {
    // Default case: Generate files without themes
    const defaultFiles = [
      ...(exportConfiguration.exportBaseValues
        ? [
            ...Object.values(TokenType).map((type) => styleOutputFile(type, tokens, tokenGroups)),
            ...(exportConfiguration.generateFolderIndexFiles ? [folderIndexOutputFile(tokens, exportConfiguration.baseStyleFilePath)] : []),
          ]
        : []),
      ...(exportConfiguration.generateIndexFile ? [indexOutputFile(tokens)] : []),
      ...(exportConfiguration.generateTypeDefinitions ? [typesOutputFile(tokens, tokenGroups)] : []),
    ]
    outputFiles = processOutputFiles(defaultFiles)
  }

  // Write property name of each token if the property to write to was provided in settings
  if (!context.isPreview && exportConfiguration.writeNameToProperty) {
    const writeStore = new WriteTokenPropStore(sdk, remoteVersionIdentifier)
    await writeStore.writeTokenProperties(exportConfiguration.propertyToWriteNameTo, tokens, (token) => {
      return tokenObjectKeyName(token, tokenGroups)
    })
  }

  // Finalize export by retrieving the files to write to destination
  return outputFiles
})
