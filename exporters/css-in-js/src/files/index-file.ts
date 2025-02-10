import { FileHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { hasThemedTokens } from "../utils/theme-utils"
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"

export function indexOutputFile(tokens: Array<Token>, themes: Array<TokenTheme | string> = []): OutputTextFile | null {
  // Skip if disabled
  if (!exportConfiguration.generateIndexFile) {
    return null
  }

  // Get all unique token types
  const types = [...new Set(tokens.map((token) => token.tokenType))]

  // Create imports and exports for each type
  const imports = types
    .map((type) => {
      const fileName = exportConfiguration.customizeStyleFileNames
        ? exportConfiguration.styleFileNames[type].replace('.css', '')
        : DEFAULT_STYLE_FILE_NAMES[type].replace('.css', '')
      return `import { ${type}Tokens } from "${exportConfiguration.baseStyleFilePath}/${fileName}";`
    })
    .join("\n")

  // Add theme imports if any
  const themeImports = themes.map((theme) => {
    const themePath = typeof theme === 'string' ? theme : theme.name.toLowerCase()
    const themeName = typeof theme === 'string' ? theme : theme.name
    
    const themeTypes = exportConfiguration.exportOnlyThemedTokens && typeof theme !== 'string'
      ? types.filter(type => hasThemedTokens(tokens, type, theme))
      : types

    return themeTypes
      .map((type) => {
        const fileName = exportConfiguration.customizeStyleFileNames
          ? exportConfiguration.styleFileNames[type].replace('.css', '')
          : DEFAULT_STYLE_FILE_NAMES[type].replace('.css', '')
        return `import { ${type}Tokens as ${type}${themeName}Tokens } from "./${themePath}/${fileName}";`
      })
      .join("\n")
  }).join("\n")

  // Export all tokens
  const exports = `\nexport {\n${types.map(type => `  ${type}Tokens`).join(',\n')}`
    + (themes.length > 0 ? ',\n' + themes.map(theme => {
      const themeName = typeof theme === 'string' ? theme : theme.name
      return types.map(type => `  ${type}${themeName}Tokens`).join(',\n')
    }).join(',\n') : '')
    + '\n};\n'

  // Ensure indexFileName ends with .ts
  let fileName = exportConfiguration.indexFileName.replace('.css', '.ts')

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: fileName,
    content: imports + '\n\n' + themeImports + exports,
  })
}
