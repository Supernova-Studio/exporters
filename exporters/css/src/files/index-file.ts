import { FileHelper, FileNameHelper, ThemeHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { getStyleFileName } from "../utils/file-utils"
import { FileStructure } from "../../config"

/**
 * Generates an index CSS file that imports all token style files and theme variations.
 * This file serves as the main entry point for all token styles.
 * 
 * The function supports two file structure modes:
 * 1. Single File: All tokens are combined into one file per theme
 *    - tokens.css (base tokens)
 *    - tokens.dark.css (dark theme)
 *    - tokens.light.css (light theme)
 * 
 * 2. Separate by Type: Tokens are split into files by type for each theme
 *    - base/colors.css, base/typography.css (base tokens)
 *    - dark/colors.css, dark/typography.css (dark theme)
 *    - light/colors.css, light/typography.css (light theme)
 * 
 * @param tokens - Array of design tokens to process
 * @param themes - Array of token themes or theme names to include
 * @returns OutputTextFile containing the index file, or null if generation is disabled
 */
export function indexOutputFile(tokens: Array<Token>, themes: Array<TokenTheme | string> = []): OutputTextFile | null {
  // Skip if index file generation is disabled in configuration
  if (!exportConfiguration.generateIndexFile) {
    return null
  }

  // =========================================
  // Single File Mode
  // =========================================
  if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
    // Generate import for base tokens file (tokens.css)
    const baseImport = exportConfiguration.exportBaseValues 
      ? `/* Base tokens */\n@import './tokens.css';`
      : ''

    // Generate imports for theme files (tokens.{theme}.css)
    const themeImports = themes.map((theme) => {
      const themePath = ThemeHelper.getThemeIdentifier(theme)
      const themeName = ThemeHelper.getThemeName(theme)
      return `/* Theme: ${themeName} */\n@import './tokens.${themePath}.css';`
    }).join("\n\n")

    const separator = baseImport && themeImports ? "\n\n" : ""
    const fileName = FileNameHelper.ensureFileExtension(exportConfiguration.indexFileName, '.css')

    return FileHelper.createTextFile({
      relativePath: exportConfiguration.baseIndexFilePath,
      fileName: fileName,
      content: baseImport + separator + themeImports,
    })
  }

  // =========================================
  // Separate by Type Mode
  // =========================================
  
  // Get all unique token types (color, typography, etc.)
  const types = [...new Set(tokens.map((token) => token.tokenType))]

  // Generate imports for base token files (./base/color.css, ./base/typography.css, etc.)
  const imports = exportConfiguration.exportBaseValues 
    ? `/* Base tokens */\n` + types
        .map((type) => `@import '${exportConfiguration.baseStyleFilePath}/${getStyleFileName(type, '.css')}';`)
        .join("\n")
    : ''

  // Generate imports for themed token files
  const themeImports = themes.map((theme) => {
    const themePath = ThemeHelper.getThemeIdentifier(theme)
    const themeName = ThemeHelper.getThemeName(theme)
    
    // Get token types for this theme
    // If exportOnlyThemedTokens is true, only include types that have themed values
    const themeTypes = exportConfiguration.exportOnlyThemedTokens && typeof theme !== 'string'
      ? types.filter(type => ThemeHelper.hasThemedTokens(tokens, type, theme))
      : types

    // Generate imports for each token type in this theme
    return themeTypes
      .map((type, index) => {
        const themeComment = index === 0 ? `/* Theme: ${themeName} */\n` : ''
        return `${themeComment}@import './${themePath}/${getStyleFileName(type, '.css')}';`
      })
      .join("\n")
  }).join("\n\n")

  // Add spacing between base imports and theme imports if both sections exist
  const separator = imports && themeImports ? "\n\n" : ""

  // Ensure the index file has the correct .css extension
  const fileName = FileNameHelper.ensureFileExtension(exportConfiguration.indexFileName, '.css')

  // Create and return the index file with all imports
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: fileName,
    content: imports + separator + themeImports,
  })
}
