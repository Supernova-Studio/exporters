/**
 * This file is the main entry point for the Tailwind CSS exporter.
 * It handles the export process, including fetching tokens, processing themes,
 * and generating the appropriate output files based on the export configuration.
 */

import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, Token, TokenGroup, TokenTheme, OutputTextFile } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration, ThemeExportStyle, FileStructure } from "../config"
import { styleOutputFile, generateStyleFiles, indexOutputFile, resetOutputFile } from "./files/tailwind-file"
import { ThemeHelper, WriteTokenPropStore } from "@supernovaio/export-utils"
import { tokenVariableName, isAllowedTokenType } from "./content/token"
import { variableToTailwindClassName } from "./utils/tailwind-class"

/** Exporter configuration from the resolved default configuration and user overrides */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Checks if any Tailwind styles are disabled in the configuration
 * This function centralizes the check for disabled styles to improve code maintainability
 * 
 * @returns boolean indicating if any styles are disabled
 */
function shouldDisableDefaultTailwindConfiguration(): boolean {
    return exportConfiguration.disableAllDefaults || 
           exportConfiguration.disableAnimateDefaults || 
           exportConfiguration.disableBlurDefaults || 
           exportConfiguration.disableBorderRadiusDefaults || 
           exportConfiguration.disableBreakpointDefaults || 
           exportConfiguration.disableColorDefaults || 
           exportConfiguration.disableContainerDefaults || 
           exportConfiguration.disableDropShadowDefaults || 
           exportConfiguration.disableFontDefaults || 
           exportConfiguration.disableFontWeightDefaults || 
           exportConfiguration.disableInsetDefaults || 
           exportConfiguration.disableLeadingDefaults || 
           exportConfiguration.disablePerspectiveDefaults || 
           exportConfiguration.disableShadowDefaults || 
           exportConfiguration.disableSpacingDefaults || 
           exportConfiguration.disableTextDefaults || 
           exportConfiguration.disableTrackingDefaults;
}

/**
 * Filters out null values from an array of output files
 * This helper function ensures we only return valid output files
 * 
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
        // Apply themes directly to tokens and generate a single file
        tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
        if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
          return processOutputFiles([
            styleOutputFile(tokens, tokenGroups),
            indexOutputFile(tokens)
          ])
        } else {
          const styleFiles = generateStyleFiles(tokens, tokenGroups)
          const resetFile = resetOutputFile()
          const indexFile = indexOutputFile(tokens)
          return [...styleFiles, ...(resetFile ? [resetFile] : []), ...(indexFile ? [indexFile] : [])]
        }

      case ThemeExportStyle.SeparateFiles:
        // Generate separate files for each theme
        let outputFiles: Array<OutputTextFile> = []
        
        // Add reset file only if file structure is separate per type
        if (exportConfiguration.fileStructure === FileStructure.SeparateByType) {
          const resetFile = resetOutputFile()
          if (resetFile) outputFiles.push(resetFile)
        }
        
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
        // Generate a single merged theme file
        let mergedOutputFiles: Array<OutputTextFile> = []
        
        // Add reset file only if file structure is separate per type
        if (exportConfiguration.fileStructure === FileStructure.SeparateByType) {
          const resetFile = resetOutputFile()
          if (resetFile) mergedOutputFiles.push(resetFile)
        }
        
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
    const resetFile = exportConfiguration.fileStructure === FileStructure.SeparateByType && shouldDisableDefaultTailwindConfiguration() ? resetOutputFile() : null
    const indexFile = indexOutputFile(tokens)
    return [...styleFiles, ...(resetFile ? [resetFile] : []), ...(indexFile ? [indexFile] : [])]
  }
})

/**
 * Helper function to generate files for a given set of tokens and themes
 * This function is used by the main export function to generate files based on the configuration
 * 
 * @param tokens - Array of tokens to process
 * @param tokenGroups - Array of token groups
 * @param themes - Array of themes to include
 * @returns Array of OutputTextFile objects
 */
export function generateFiles(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themes: Array<TokenTheme> = []): Array<OutputTextFile> {
    const files: Array<OutputTextFile> = []

    // Add reset file only if file structure is separate per type
    if (exportConfiguration.fileStructure === FileStructure.SeparateByType) {
        const resetFile = resetOutputFile()
        if (resetFile) {
            files.push(resetFile)
        }
    }

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
