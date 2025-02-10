import { FileHelper, ThemeHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"
import { getStyleFileName } from "../utils/file-utils"

// Helper function to ensure .css extension
function ensureExtension(fileName: string, extension: string): string {
  return fileName.toLowerCase().endsWith(extension) ? fileName : `${fileName}${extension}`
}

export function indexOutputFile(tokens: Array<Token>, themes: Array<TokenTheme | string> = []): OutputTextFile | null {
  // Skip if disabled
  if (!exportConfiguration.generateIndexFile) {
    return null
  }

  // Get all unique token types
  const types = [...new Set(tokens.map((token) => token.tokenType))]

  // Create imports for each type - only if exportBaseValues is true
  const imports = exportConfiguration.exportBaseValues 
    ? types
        .map((type) => `@import "${exportConfiguration.baseStyleFilePath}/${getStyleFileName(type, '.css')}";`)
        .join("\n")
    : ''

  // Add theme imports if any
  const themeImports = themes.map((theme) => {
    const themePath = ThemeHelper.getThemeIdentifier(theme)
    const themeName = ThemeHelper.getThemeName(theme)
    
    // If exportOnlyThemedTokens is enabled, only include types that have themed tokens
    const themeTypes = exportConfiguration.exportOnlyThemedTokens && typeof theme !== 'string'
      ? types.filter(type => ThemeHelper.hasThemedTokens(tokens, type, theme))
      : types

    return themeTypes
      .map((type, index) => {
        // Add theme name comment only before the first import of the theme
        const themeComment = index === 0 ? `\n/* Theme: ${themeName} */\n` : ''
        return `${themeComment}@import "./${themePath}/${getStyleFileName(type, '.css')}";`
      })
      .join("\n")
  }).join("\n")

  // Only add newlines between base imports and theme imports if both exist
  const separator = imports && themeImports ? "\n\n" : ""

  // Handle index file name extension
  const fileName = ensureExtension(exportConfiguration.indexFileName, '.css')

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: fileName,
    content: imports + separator + themeImports,
  })
}
