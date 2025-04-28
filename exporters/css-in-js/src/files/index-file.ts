import { FileHelper, FileNameHelper, GeneralHelper, StringCase, ThemeHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"

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
    // Group imports and exports together
    const imports: string[] = []
    
    // Base tokens
    if (exportConfiguration.exportBaseValues) {
      imports.push(`export { default as base } from "${exportConfiguration.baseStyleFilePath}";`)
    }
    
    // Theme tokens
    themes.forEach(theme => {
      const themeId = ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)
      imports.push(`export { default as ${themeId} } from "./${themeId}";`)
    })

    // Add imports to content
    content += imports.join('\n')
  } else {
    // Export individual files
    const usedTokenTypes = new Set(tokens.map(t => t.tokenType))

    // Export base tokens if enabled
    if (exportConfiguration.exportBaseValues) {
      Object.values(TokenType)
        .filter(type => usedTokenTypes.has(type))
        .forEach(type => {
          // We use DEFAULT_STYLE_FILE_NAMES as fallback because styleFileNames from configuration
          // can be customized by the user, and we need access to original default values
          const fileName = exportConfiguration.customizeStyleFileNames
            ? FileNameHelper.ensureFileExtension(exportConfiguration.styleFileNames[type], ".ts")
            : DEFAULT_STYLE_FILE_NAMES[type]
          content += `export * from "${exportConfiguration.baseStyleFilePath}/${fileName}";\n`
        })
    }

    // Generate imports for themed tokens
    themes.forEach(theme => {
      const themeId = ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)
      Object.values(TokenType)
        .filter(type => usedTokenTypes.has(type))
        .forEach(type => {
          // We use DEFAULT_STYLE_FILE_NAMES as fallback because styleFileNames from configuration
          // can be customized by the user, and we need access to original default values
          const fileName = exportConfiguration.customizeStyleFileNames
            ? FileNameHelper.ensureFileExtension(exportConfiguration.styleFileNames[type], ".ts")
            : DEFAULT_STYLE_FILE_NAMES[type]
          content += `export * from "./${themeId}/${fileName}";\n`
        })
    })
  }

  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
  }

  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: FileNameHelper.ensureFileExtension(exportConfiguration.indexFileName, ".ts"),
    content: content
  })
}
