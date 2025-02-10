import { FileHelper, ThemeHelper, FileNameHelper, GeneralHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { convertedToken } from "../content/token"
import { TokenTheme } from "@supernovaio/sdk-exporters"

/**
 * Generates a CSS output file for a specific token type, handling both base tokens and themed tokens
 * @param type - The type of tokens to generate styles for (colors, typography, etc.)
 * @param tokens - Array of all available tokens
 * @param tokenGroups - Array of token groups for reference
 * @param themePath - Optional path for theme-specific files (e.g. 'dark', 'light')
 * @param theme - Optional theme configuration for themed tokens
 * @returns OutputTextFile object if file should be generated, null otherwise
 */
export function styleOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): OutputTextFile | null {
  // Skip generating base token files if exportBaseValues is disabled and this isn't a theme file
  if (!exportConfiguration.exportBaseValues && !themePath) {
    return null
  }

  // Get all tokens matching the specified token type (colors, typography, etc.)
  let tokensOfType = tokens.filter((token) => token.tokenType === type)

  // For theme files: filter tokens to only include those that are themed
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    tokensOfType = ThemeHelper.filterThemedTokens(tokensOfType, theme)
    
    // Skip generating theme file if no tokens are themed for this type
    if (tokensOfType.length === 0) {
      return null
    }
  }

  // Skip generating file if there are no tokens and empty files are disabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null
  }

  // Create a map of all tokens by ID for reference resolution
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  // Convert tokens to CSS variable declarations
  const cssVariables = tokensOfType.map((token) => convertedToken(token, mappedTokens, tokenGroups)).join("\n")

  // Determine the CSS selector based on whether this is a theme file
  const selector = themePath 
    ? exportConfiguration.themeSelector.replace('{theme}', themePath)
    : exportConfiguration.cssSelector
  
  // Construct the file content with CSS variables wrapped in selector
  let content = `${selector} {\n${cssVariables}\n}`
  
  // Optionally add generated file disclaimer
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
  }

  // Build the output path, using theme subfolder for themed files
  const relativePath = themePath
    ? `./${themePath}`
    : exportConfiguration.baseStyleFilePath

  // Get the filename based on configuration or defaults
  let fileName = exportConfiguration.customizeStyleFileNames
    ? exportConfiguration.styleFileNames[type]
    : FileNameHelper.getDefaultStyleFileName(type)

  // Ensure proper .css extension
  if (!fileName.toLowerCase().endsWith('.css')) {
    fileName += '.css'
  }

  // Create and return the output file object
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content,
  })
}
