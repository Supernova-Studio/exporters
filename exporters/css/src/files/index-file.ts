import { FileHelper, FileNameHelper, ThemeHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { getStyleFileName } from "../utils/file-utils"

/**
 * Generates an index CSS file that imports all token style files and theme variations.
 * This file serves as the main entry point for all token styles.
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

  // Extract unique token types (e.g., 'color', 'typography', etc.) from all tokens
  const types = [...new Set(tokens.map((token) => token.tokenType))]

  // Generate imports for base token files (non-themed versions)
  // Only included if exportBaseValues is enabled in configuration
  const imports = exportConfiguration.exportBaseValues 
    ? types
        .map((type) => `@import "${exportConfiguration.baseStyleFilePath}/${getStyleFileName(type, '.css')}";`)
        .join("\n")
    : ''

  // Generate imports for themed token files
  const themeImports = themes.map((theme) => {
    const themePath = ThemeHelper.getThemeIdentifier(theme)
    const themeName = ThemeHelper.getThemeName(theme)
    
    // Filter token types based on configuration:
    // If exportOnlyThemedTokens is true, only include types that actually have themed tokens
    // Otherwise include all token types for each theme
    const themeTypes = exportConfiguration.exportOnlyThemedTokens && typeof theme !== 'string'
      ? types.filter(type => ThemeHelper.hasThemedTokens(tokens, type, theme))
      : types

    return themeTypes
      .map((type, index) => {
        // Add a theme name comment before the first import of each theme group
        const themeComment = index === 0 ? `\n/* Theme: ${themeName} */\n` : ''
        return `${themeComment}@import "./${themePath}/${getStyleFileName(type, '.css')}";`
      })
      .join("\n")
  }).join("\n")

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
