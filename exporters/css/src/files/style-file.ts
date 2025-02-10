import { FileHelper, ThemeHelper, FileNameHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { convertedToken } from "../content/token"
import { TokenTheme } from "@supernovaio/sdk-exporters"

export function styleOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): OutputTextFile | null {
  // Skip base token files if exportBaseValues is false and this is not a theme file
  if (!exportConfiguration.exportBaseValues && !themePath) {
    return null
  }

  // Filter tokens by top level type
  let tokensOfType = tokens.filter((token) => token.tokenType === type)

  // If this is a theme file, handle themed tokens
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    tokensOfType = ThemeHelper.filterThemedTokens(tokensOfType, theme)
    
    // If no tokens are themed, don't generate the file at all
    if (tokensOfType.length === 0) {
      return null
    }
  }

  // Filter out files where there are no tokens, if enabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null
  }

  // Convert all tokens to CSS variables
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  const cssVariables = tokensOfType.map((token) => convertedToken(token, mappedTokens, tokenGroups)).join("\n")

  // Create file content
  const selector = themePath 
    ? exportConfiguration.themeSelector.replace('{theme}', themePath)
    : exportConfiguration.cssSelector
  let content = `${selector} {\n${cssVariables}\n}`
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    // Add disclaimer to every file if enabled
    content = `/* ${exportConfiguration.disclaimer} */\n${content}`
  }

  // Get the full path including theme folder if provided
  const relativePath = themePath
    ? `./${themePath}`
    : exportConfiguration.baseStyleFilePath

  // Use default style file names
  let fileName = exportConfiguration.customizeStyleFileNames
    ? exportConfiguration.styleFileNames[type]
    : FileNameHelper.getDefaultStyleFileName(type)

  // Ensure filename ends with .css
  if (!fileName.toLowerCase().endsWith('.css')) {
    fileName += '.css'
  }

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content,
  })
}
