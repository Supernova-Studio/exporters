import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, Token, TokenGroup, TokenTheme, OutputTextFile } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle, FileStructure } from "../config"
import { styleOutputFile, generateStyleFiles, indexOutputFile } from "./files/tailwind-file"
import { ThemeHelper, WriteTokenPropStore } from "@supernovaio/export-utils"
import { tokenVariableName, isAllowedTokenType } from "./content/token"
import { variableToTailwindClassName } from "./utils/tailwind-class"

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

  // Write back generated Tailwind classnames and CSS variable names to token properties
  // This allows designers to see the generated names directly in their design system
  // Only runs during actual export, not in preview mode
  if (!context.isPreview && (exportConfiguration.writeClassnameToProperty || exportConfiguration.writeCSSVariableNameToProperty)) {
    const writeStore = new WriteTokenPropStore(sdk, remoteVersionIdentifier)

    // Get only tokens that can be used in Tailwind (colors, spacing, etc)
    // Filters out unsupported token types like assets or compositions
    const allowedTokens = tokens.filter(token => isAllowedTokenType(token.tokenType))

    // Write generated Tailwind classnames (e.g. "bg-primary") back to tokens
    // These will appear in the "Tailwind class" property of each token
    if (exportConfiguration.writeClassnameToProperty) {
      await writeStore.writeTokenProperties(exportConfiguration.propertyToWriteClassnameTo, allowedTokens, (token) => {
        return variableToTailwindClassName(tokenVariableName(token, tokenGroups))
      })
    }

    // Write generated CSS variable names back to tokens
    // These will appear in the "CSS variable" property of each token
    // Can be written as plain names (--color-primary) or with var() syntax
    if (exportConfiguration.writeCSSVariableNameToProperty) {
      await writeStore.writeTokenProperties(exportConfiguration.propertyToWriteCSSVariableNameTo, allowedTokens, (token) => {
        if (exportConfiguration.propertyToWriteCSSVariableNameToIncludesVar) {
          return `var(--${tokenVariableName(token, tokenGroups)})`
        } else {
          return tokenVariableName(token, tokenGroups)
        }
      })
    }
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
        if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
          return processOutputFiles([
            styleOutputFile(tokens, tokenGroups),
            indexOutputFile(tokens)
          ])
        } else {
          const styleFiles = generateStyleFiles(tokens, tokenGroups)
          return [...styleFiles, indexOutputFile(tokens) || []].flat()
        }

      case ThemeExportStyle.SeparateFiles:
        let outputFiles: Array<OutputTextFile> = []
        
        // Generate base files if exportBaseValues is true
        if (exportConfiguration.exportBaseValues) {
          if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
            const baseFile = styleOutputFile(tokens, tokenGroups)
            if (baseFile) outputFiles.push(baseFile)
          } else {
            const baseFiles = generateStyleFiles(tokens, tokenGroups)
            outputFiles = [...outputFiles, ...baseFiles]
          }
        }
        
        // Generate theme files
        themesToApply.forEach(theme => {
          const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
          if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
            const themeFile = styleOutputFile(
              themedTokens, 
              tokenGroups, 
              ThemeHelper.getThemeIdentifier(theme),
              theme
            )
            if (themeFile) outputFiles.push(themeFile)
          } else {
            const themeFiles = generateStyleFiles(
              themedTokens, 
              tokenGroups, 
              ThemeHelper.getThemeIdentifier(theme),
              theme
            )
            outputFiles = [...outputFiles, ...themeFiles]
          }
        })
        
        // Add index file
        const indexFile = indexOutputFile(tokens, themesToApply)
        if (indexFile) outputFiles.push(indexFile)
        
        return outputFiles

      case ThemeExportStyle.MergedTheme:
        let mergedOutputFiles: Array<OutputTextFile> = []
        
        // Generate base files if exportBaseValues is true
        if (exportConfiguration.exportBaseValues) {
          if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
            const baseFile = styleOutputFile(tokens, tokenGroups)
            if (baseFile) mergedOutputFiles.push(baseFile)
          } else {
            const baseFiles = generateStyleFiles(tokens, tokenGroups)
            mergedOutputFiles = [...mergedOutputFiles, ...baseFiles]
          }
        }
        
        // Generate merged theme file
        const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
          const mergedThemeFile = styleOutputFile(
            themedTokens, 
            tokenGroups, 
            'themed',
            themesToApply[0]
          )
          if (mergedThemeFile) mergedOutputFiles.push(mergedThemeFile)
        } else {
          const mergedThemeFiles = generateStyleFiles(
            themedTokens, 
            tokenGroups, 
            'themed',
            themesToApply[0]
          )
          mergedOutputFiles = [...mergedOutputFiles, ...mergedThemeFiles]
        }
        
        // Add index file
        const mergedIndexFile = indexOutputFile(tokens, ['themed'])
        if (mergedIndexFile) mergedOutputFiles.push(mergedIndexFile)
        
        return mergedOutputFiles
    }
  }

  // Default case: Generate files without themes
  if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
    return processOutputFiles([
      exportConfiguration.exportBaseValues ? styleOutputFile(tokens, tokenGroups) : null,
      indexOutputFile(tokens)
    ])
  } else {
    const styleFiles = exportConfiguration.exportBaseValues 
    ? generateStyleFiles(tokens, tokenGroups) 
    : []
    return [...styleFiles, indexOutputFile(tokens) || []].flat()
  }
})

export function generateFiles(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themes: Array<TokenTheme> = []): Array<OutputTextFile> {
    const files: Array<OutputTextFile> = []

    // Generate the main Tailwind CSS file
    if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
        const mainFile = styleOutputFile(tokens, tokenGroups)
        if (mainFile) {
            files.push(mainFile)
        }
    } else {
        const mainFiles = generateStyleFiles(tokens, tokenGroups)
        files.push(...mainFiles)
    }

    // Generate themed files if needed
    themes.forEach(theme => {
        if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
            const themedFile = styleOutputFile(
                tokens, 
                tokenGroups, 
                ThemeHelper.getThemeIdentifier(theme), 
                theme
            )
            if (themedFile) {
                files.push(themedFile)
            }
        } else {
            const themedFiles = generateStyleFiles(
                tokens, 
                tokenGroups, 
                ThemeHelper.getThemeIdentifier(theme), 
                theme
            )
            files.push(...themedFiles)
        }
    })

    // Add index file
    const indexFile = indexOutputFile(tokens, themes)
    if (indexFile) {
        files.push(indexFile)
    }

    return files
}
