import { FileHelper, FileNameHelper, GeneralHelper, ImportCollector, ThemeHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenTheme, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { convertedToken } from "../content/token"
import { FileStructure } from "../../config"
import { DesignSystemCollection } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"

//todo rename file, function?
/**
 * Main entry point for generating style files
 * @param tokens - Array of all available tokens
 * @param tokenGroups - Array of token groups for reference
 * @param themePath - Optional path for theme-specific files
 * @param theme - Optional theme configuration for themed tokens
 * @param tokenCollections
 * @returns Array of OutputTextFile objects
 */
export function generateStyleFiles(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  themePath: string = "",
  theme?: TokenTheme,
  tokenCollections: Array<DesignSystemCollection> = []
): Array<OutputTextFile> {
  // Skip generating base token files if exportBaseValues is disabled and this isn't a theme file
  if (!exportConfiguration.exportBaseValues && !themePath) {
    return []
  }

  // For single file output
  if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
    const result = generateCombinedFile(tokens, tokenGroups, themePath, theme, tokenCollections)
    return result ? [result] : []
  }

  // For separate files by type (existing logic)
  return [...new Set(tokens.map((token) => token.tokenType))]
    .map((type) => singleTypeFile(type, tokens, tokenGroups, themePath, theme, tokenCollections))
    .filter((file): file is OutputTextFile => file !== null)
}

/**
 * Generates a Kotlin output file for a specific token type, handling both base tokens and themed tokens.
 * @param type - The type of tokens to generate file for (colors, typography, etc.)
 * @param tokens - Array of all available tokens
 * @param tokenGroups - Array of token groups for reference
 * @param themePath - Optional path for theme-specific files (e.g. 'dark', 'light')
 * @param theme - Optional theme configuration for themed tokens
 * @param tokenCollections - Array of token collections for reference
 * @returns OutputTextFile object if the file should be generated, null otherwise
 */
function singleTypeFile(
  type: TokenType,
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  themePath: string = "",
  theme?: TokenTheme,
  tokenCollections: Array<DesignSystemCollection> = []
): OutputTextFile | null {
  // Skip generating base token files if exportBaseValues is disabled and this isn't a theme file
  if (!exportConfiguration.exportBaseValues && !themePath) {
    return null
  }

  // Get all tokens matching the specified token type (colors, typography, etc.)
  let tokensOfType = tokens.filter((token) => token.tokenType === type)

  // For theme files: filter tokens to only include those that are themed
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    tokensOfType = ThemeHelper.filterThemedTokens(tokensOfType, theme)

    // Skip generating a theme file if no tokens are themed for this type
    if (tokensOfType.length === 0) {
      return null
    }
  }

  // Skip generating file if there are no tokens and empty files are disabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null
  }

  const content = generateFileContent(tokens, tokensOfType, tokenGroups, tokenCollections)

  //todo themes
  // Build the output path, using the theme subfolder for themed files
  const relativePath = themePath ? `./${themePath}` : exportConfiguration.baseStyleFilePath

  // Get the filename based on configuration or defaults
  let fileName = exportConfiguration.customizeStyleFileNames
    ? exportConfiguration.styleFileNames[type]
    : FileNameHelper.getDefaultStyleFileName(type, "kt")

  // Ensure proper .kt extension
  fileName = FileNameHelper.ensureFileExtension(fileName, "kt")

  // Create and return the output file object
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content
  })
}

/**
 * Generates a single CSS file containing all token types
 */
function generateCombinedFile(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  themePath: string = "",
  theme?: TokenTheme,
  tokenCollections: Array<DesignSystemCollection> = []
): OutputTextFile | null {
  let filteredTokens = tokens

  // For theme files: filter tokens to only include those that are themed
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    filteredTokens = ThemeHelper.filterThemedTokens(filteredTokens, theme)

    // Skip generating a theme file if no tokens are themed
    if (filteredTokens.length === 0) {
      return null
    }
  }

  // Skip generating file if there are no tokens and empty files are disabled
  if (!exportConfiguration.generateEmptyFiles && filteredTokens.length === 0) {
    return null
  }

  const content = generateFileContent(tokens, filteredTokens, tokenGroups, tokenCollections)

  // For single file mode, themed files go directly in root with theme-based names
  const fileName = themePath ? `tokens.${themePath}.kt` : "tokens.kt"
  const relativePath = "./" // Put files directly in the root folder

  // Create and return the output file
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content
  })
}

function generateFileContent(
  allTokens: Array<Token>,
  tokensToExport: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  tokenCollections: Array<DesignSystemCollection>,
  themePath: string = ""
) {
  //todo customizable
  const packageLiteral = "package com.supernova.tokens"

  const importCollector = new ImportCollector()

  // Determine the Kotlin object name
  const objectNameSuffix = themePath ? exportConfiguration.objectSuffixForThemes.replace("{theme}", themePath) : ""
  const objectLiteral = `@Immutable\n` + `object ${exportConfiguration.objectName}${objectNameSuffix}`

  // Create a map of all tokens by ID for reference resolution
  const mappedTokens = new Map(allTokens.map((token) => [token.id, token]))
  // Convert tokens to Kotlin variable declarations
  const tokenVariablesLiteral = tokensToExport
    .map((token) => convertedToken(token, mappedTokens, tokenGroups, tokenCollections, importCollector))
    .join("\n")

  let allImports = ["import androidx.compose.runtime.Immutable", ...importCollector.allImports()].sort()
  const importsLiteral = allImports.join("\n")

  // Construct the file content with an object with token variables
  let content = `${packageLiteral}\n\n${importsLiteral}\n\n${objectLiteral} {\n${tokenVariablesLiteral}\n}`

  // Optionally add a generated file disclaimer
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
  }

  return content
}
