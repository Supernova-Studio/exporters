import {
  FileHelper,
  FileNameHelper,
  GeneralHelper,
  NamingHelper,
  StringCase,
  ThemeHelper
} from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenTheme, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { getTokenTypeFileName } from "../utils/file-utils"
import { FileStructure } from "../../config"
import { getPackageName } from "../utils/package-utils"
import { getObjectNameFromFileName, getObjectNameFromTokenType } from "../utils/object-utils"

// TODO clean, polish, doc comment

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
 * @returns OutputTextFile array with index files
 */
export function indexFiles(tokens: Array<Token>, themes: Array<TokenTheme> | undefined): OutputTextFile[] {
  // Skip if index file generation is disabled in configuration
  if (!exportConfiguration.generateIndexFile) {
    return []
  }

  // =========================================
  // Single File Mode
  // =========================================
  if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
    // Generate import for base tokens file (tokens.css)
    const baseImport = exportConfiguration.exportBaseValues ? `/* Base tokens */\n@import "./tokens.css";` : ""

    // Generate imports for theme files (tokens.{theme}.css)
    const themeImports = themes
      .map((theme) => {
        const themePath = ThemeHelper.getThemeIdentifier(theme)
        const themeName = ThemeHelper.getThemeName(theme)
        return `/* Theme: ${themeName} */\n@import "./tokens.${themePath}.css";`
      })
      .join("\n\n")

    const separator = baseImport && themeImports ? "\n\n" : ""
    const fileName = FileNameHelper.ensureFileExtension(exportConfiguration.indexFileName, ".css")

    // todo
    // return FileHelper.createTextFile({
    //   relativePath: exportConfiguration.baseIndexFilePath,
    //   fileName: fileName,
    //   content: baseImport + separator + themeImports,
    // })
  }

  // =========================================
  // Separate by Type Mode
  // =========================================

  // Get all unique token types (color, typography, etc.)
  const types = [...new Set(tokens.map((token) => token.tokenType))]

  const indexFiles = Array<OutputTextFile>()

  // Generate the index file for the base tokens
  if (exportConfiguration.exportBaseValues) {
    indexFiles.push(generateIndexFile(undefined, types))
  }

  // Generate an index file per themed tokens
  themes
    ?.map((theme) => {
      // Get token types for this theme
      // If exportOnlyThemedTokens is true, only include types that have themed values
      const themeTypes = exportConfiguration.exportOnlyThemedTokens
        ? types.filter((type) => ThemeHelper.hasThemedTokens(tokens, type, theme))
        : types

      return generateIndexFile(theme, themeTypes)
    })
    .map((file) => indexFiles.push(file))

  return indexFiles
}

function generateIndexFile(theme: TokenTheme | undefined, types: Array<TokenType>): OutputTextFile {
  const fileName = FileNameHelper.ensureFileExtension(exportConfiguration.indexFileName, ".kt")

  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  let content =
    `package ${getPackageName(theme)}\n\n` +
    "import androidx.compose.runtime.Immutable\n\n" +
    `@Immutable\n` +
    `object ${getObjectNameFromFileName(fileName)} {\n` +
    types
      .map((type) => {
        const objectName = getObjectNameFromTokenType(type)
        let propertyName = NamingHelper.codeSafeVariableName(objectName, StringCase.camelCase)

        return `${indentString}val ${propertyName} = ${objectName}`
      })
      .join("\n") +
    "\n}"

  const relativePath = theme
    ? `./${ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)}`
    : exportConfiguration.nonThemedFilePath

  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
  }

  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content
  })
}
