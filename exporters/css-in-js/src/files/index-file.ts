import { FileHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"
import { getThemeIdentifier } from "../utils/theme-utils"

/**
 * Generates the root index.ts file that exports all themes and base tokens.
 * This file serves as the main entry point for consuming the design tokens.
 * 
 * When folder index files are enabled, it generates clean imports like:
 * ```typescript
 * export { default as base } from "./base";
 * export { default as dark } from "./dark";
 * ```
 * 
 * Which allows users to consume tokens like:
 * ```typescript
 * import { base, dark } from './tokens'
 * console.log(base.primary)
 * ```
 * 
 * @param tokens - Array of all tokens
 * @param themes - Array of themes to export
 * @returns OutputTextFile with the generated index content or null if generation is disabled
 */
export function indexOutputFile(tokens: Array<Token>, themes: Array<string | TokenTheme> = []): OutputTextFile | null {
  if (!exportConfiguration.generateIndexFile) {
    return null
  }

  let content = ''

  if (exportConfiguration.generateFolderIndexFiles) {
    // Add disclaimer if enabled
    if (exportConfiguration.showGeneratedFileDisclaimer) {
      content += `/**\n * ${exportConfiguration.disclaimer.replace(/\n/g, '\n * ')} \n*/\n\n`
    }

    // Group imports and exports together
    const imports: string[] = []
    const exports: string[] = []
    
    // Base tokens
    if (exportConfiguration.exportBaseValues) {
      imports.push(`export { default as base } from "${exportConfiguration.baseStyleFilePath}";`)
    }
    
    // Theme tokens
    themes.forEach(theme => {
      const themeId = getThemeIdentifier(theme)
      imports.push(`export { default as ${themeId} } from "./${themeId}";`)
    })

    // Add imports to content
    content += imports.join('\n')
  } else {
    // Original behavior - import individual files
    const usedTokenTypes = new Set(tokens.map(t => t.tokenType))

    if (exportConfiguration.exportBaseValues) {
      Object.values(TokenType)
        .filter(type => usedTokenTypes.has(type))
        .forEach(type => {
          const fileName = exportConfiguration.customizeStyleFileNames
            ? exportConfiguration.styleFileNames[type].replace('.css', '').replace('.ts', '')
            : DEFAULT_STYLE_FILE_NAMES[type].replace('.css', '').replace('.ts', '')
          content += `export * from "${exportConfiguration.baseStyleFilePath}/${fileName}";\n`
        })
    }

    // Generate imports for themed tokens
    themes.forEach(theme => {
      const themeId = getThemeIdentifier(theme)
      Object.values(TokenType)
        .filter(type => usedTokenTypes.has(type))
        .forEach(type => {
          const fileName = exportConfiguration.customizeStyleFileNames
            ? exportConfiguration.styleFileNames[type].replace('.css', '').replace('.ts', '')
            : DEFAULT_STYLE_FILE_NAMES[type].replace('.css', '').replace('.ts', '')
          content += `export * from "./${themeId}/${fileName}";\n`
        })
    })
  }

  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: exportConfiguration.indexFileName,
    content: content
  })
}
