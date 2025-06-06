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

/**
 * Generates index files based on token data and themes provided.
 *
 * @param tokens - The array of tokens to process for index file generation.
 * @param themes - The array of token themes. If undefined, only base tokens are considered.
 * @return An array of index files generated based on the provided configuration, tokens, and themes.
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
    // No need to generate any umbrella files since all tokens are already combined into one file per theme
    return []
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

  // Generate an index file per theme
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
