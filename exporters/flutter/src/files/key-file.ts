import { FileHelper } from '@supernovaio/export-helpers'
import { OutputTextFile, Token, TokenGroup, TokenType } from '@supernovaio/sdk-exporters'
import { exportConfiguration } from '..'
import { convertedTokenKey } from '../content/token'

export function keyOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): OutputTextFile | null {
  if (!exportConfiguration.useKeysFile) {
    return null
  }

  // Filter tokens by top level type
  const tokensOfType = tokens.filter((token) => token.tokenType === type)

  // Filter out files where there are no tokens, if enabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null
  }

  const newLines = '\n'.repeat(exportConfiguration.newLines)
  const convertedTokens = tokensOfType.map((token) => convertedTokenKey(token, tokenGroups)).join(newLines)
  let content = `class ${exportConfiguration.keyNames[type]} {\n${convertedTokens}\n}`

  // Add disclaimer to every file if enabled
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = `/* ${exportConfiguration.disclaimer} */\n${content}`
  }

  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseKeysFilePath,
    fileName: exportConfiguration.keyFileNames[type],
    content: content
  })
}
