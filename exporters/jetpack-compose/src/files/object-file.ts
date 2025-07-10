import {
  FileHelper,
  FileNameHelper,
  GeneralHelper,
  ImportCollector,
  NamingHelper,
  StringCase,
  ThemeHelper
} from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenTheme, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { convertedToken, resetTokenNameTracking } from "../content/token"
import { FileStructure } from "../../config"
import { DesignSystemCollection } from "@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection"
import { getTokenTypeFileName } from "../utils/file-utils"
import { getObjectNameFromFileName, getObjectNameFromTokenType } from "../utils/object-utils"
import { getPackageName } from "../utils/package-utils"

/**
 * Main entry point for generating Kotlin object files
 * @param tokens - Array of all available tokens
 * @param tokenGroups - Array of token groups for reference
 * @param theme - Optional theme configuration for themed tokens
 * @param tokenCollections - Array of token collections
 * @returns Array of OutputTextFile objects
 */
export function generateObjectFiles(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  theme: TokenTheme | undefined,
  tokenCollections: Array<DesignSystemCollection>
): Array<OutputTextFile> {
  // Clear any previously cached token names to ensure clean generation
  resetTokenNameTracking()

  // Skip generating base token files if exportBaseValues is disabled and this isn't a theme file
  if (!exportConfiguration.exportBaseValues && !theme) {
    return []
  }

  // For single file output
  if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
    const result = generateCombinedFile(tokens, tokenGroups, theme, tokenCollections)
    return result ? [result] : []
  }

  // For separate files by type (existing logic)
  return [...new Set(tokens.map((token) => token.tokenType))]
    .map((type) => separateTokenTypeFile(type, tokens, tokenGroups, theme, tokenCollections))
    .filter((file): file is OutputTextFile => file !== null)
}

/**
 * Generates a Kotlin output file for a specific token type, handling both base tokens and themed tokens.
 * @param type - The type of tokens to generate file for (colors, typography, etc.)
 * @param tokens - Array of all available tokens
 * @param tokenGroups - Array of token groups for reference
 * @param theme - Optional theme configuration for themed tokens
 * @param tokenCollections - Array of token collections for reference
 * @returns OutputTextFile object if the file should be generated, null otherwise
 */
function separateTokenTypeFile(
  type: TokenType,
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  theme: TokenTheme | undefined,
  tokenCollections: Array<DesignSystemCollection>
): OutputTextFile | null {
  // Skip generating base token files if exportBaseValues is disabled and this isn't a theme file
  if (!exportConfiguration.exportBaseValues && !theme) {
    return null
  }

  // Get all tokens matching the specified token type (colors, typography, etc.)
  let tokensOfType = tokens.filter((token) => token.tokenType === type)

  // For theme files: filter tokens to only include those that are themed
  if (theme && exportConfiguration.exportOnlyThemedTokens) {
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

  // Get the filename based on configuration or defaults
  let fileName = getTokenTypeFileName(type)

  // Build the output path, using the theme subfolder for themed files
  const relativePath = theme
    ? `./${ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)}`
    : exportConfiguration.nonThemedFilePath

  const content = generateFileContent(tokensOfType, fileName, theme, tokens, tokenGroups, tokenCollections)

  // Create and return the output file object
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content
  })
}

/**
 * Generates a single Kotlin file containing all token types
 */
function generateCombinedFile(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  theme?: TokenTheme,
  tokenCollections: Array<DesignSystemCollection> = []
): OutputTextFile | null {
  let filteredTokens = tokens

  // For theme files: filter tokens to only include those that are themed
  if (theme && exportConfiguration.exportOnlyThemedTokens) {
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

  // For single file mode, all files are named identically but are placed in different folders
  const fileName = FileNameHelper.ensureFileExtension(exportConfiguration.singleFileName, "kt")
  const relativePath = theme
    ? `./${ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)}`
    : exportConfiguration.nonThemedFilePath

  const content = generateFileContent(filteredTokens, fileName, theme, tokens, tokenGroups, tokenCollections)

  // Create and return the output file
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content
  })
}

function generateFileContent(
  tokensToExport: Array<Token>,
  fileName: string,
  theme: TokenTheme | undefined,
  allTokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  tokenCollections: Array<DesignSystemCollection>
) {
  const fullPackageName = getPackageName(theme)
  const packageLiteral = `package ${fullPackageName}`

  const importCollector = new ImportCollector(exportConfiguration.rPackageName || exportConfiguration.packageNamePrefix)

  const objectLiteral = `@Immutable\n` + `object ${getObjectNameFromFileName(fileName)}`

  // Create a map of all tokens by ID for reference resolution
  const mappedTokens = new Map(allTokens.map((token) => [token.id, token]))

  // Sort tokens to ensure proper declaration order:
  // - Tokens with direct values come first
  // - Tokens that reference other tokens come after
  // This prevents reference errors where a token tries to use another token that hasn't been declared yet
  const sortedTokensToExport = [...tokensToExport].sort((a, b) => {
    const aHasRef = !!(a as any)?.value?.referencedTokenId
    const bHasRef = !!(b as any)?.value?.referencedTokenId
    return aHasRef === bHasRef ? 0 : aHasRef ? 1 : -1
  })

  // Convert tokens to Kotlin property declarations
  const tokenPropertiesLiteral = sortedTokensToExport
    .map((token) => convertedToken(token, mappedTokens, tokenGroups, tokenCollections, importCollector))
    .join("\n")

  let dynamicImports = importCollector.allImports()
  let allImports = ["import androidx.compose.runtime.Immutable", ...dynamicImports].sort()
  const importsLiteral = allImports.join("\n")

  // Construct the file content with an object with token properties
  let content = `${packageLiteral}\n\n${importsLiteral}\n\n${objectLiteral} {\n${tokenPropertiesLiteral}\n}`

  // Optionally add a generated file disclaimer
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
  }

  return content
}
