import { FileHelper } from "@supernovaio/export-helpers"
import { OutputTextFile, Token, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."

export function indexOutputFile(tokens: Array<Token>, themes: Array<TokenTheme | string> = []): OutputTextFile | null {
  // Skip if disabled
  if (!exportConfiguration.generateIndexFile) {
    return null
  }

  // Get all unique token types
  const types = [...new Set(tokens.map((token) => token.tokenType))]

  // Create imports for each type
  const imports = types
    .map((type) => `@import "${exportConfiguration.baseStyleFilePath}/${exportConfiguration.styleFileNames[type]}";`)
    .join("\n")

  // Add theme imports if any
  const themeImports = themes.map((theme) => {
    const themePath = typeof theme === 'string' ? theme : theme.name.toLowerCase()
    const themeName = typeof theme === 'string' ? theme : theme.name
    return types
      .map((type, index) => {
        // Add theme name comment only before the first import of the theme
        const themeComment = index === 0 ? `\n/* Theme: ${themeName} */\n` : ''
        return `${themeComment}@import "./${themePath}/${exportConfiguration.styleFileNames[type]}";`
      })
      .join("\n")
  }).join("\n")

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: exportConfiguration.indexFileName,
    content: imports + (themeImports ? "\n\n" + themeImports : ""),
  })
}
