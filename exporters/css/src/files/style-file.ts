import { OutputFileType, OutputTextFile, Token, TokenGroup, TokenType } from "@supernova-studio/pulsar-next"
import { config } from "../config"
import { convertedToken } from "../content/token"
import { ExportHelper } from "../helpers/ExportHelper"

export function styleOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): OutputTextFile {
  // Filter tokens by top level type
  const tokensOfType = tokens.filter((token) => token.tokenType === type)

  // Convert all tokens to CSS variables
  const cssVariables = tokensOfType.map((token) => convertedToken(token, tokens, tokenGroups)).join("\n")
  // Create file content
  let content = `:root {\n${cssVariables}\n}`
  if (config.showGeneratedFileDisclaimer) {
    // Add disclaimer to every file if enabled
    content = `/* ${config.disclaimer} */\n${content}`
  }

  // Retrieve content as file which content will be directly written to the output
  return ExportHelper.outputTextFile({
    relativePath: config.baseStyleFilePath,
    fileName: config.styleFileNames[type],
    content: content,
  })
}
