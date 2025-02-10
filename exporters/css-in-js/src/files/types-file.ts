import { FileHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { tokenObjectKeyName } from "../content/token"

export function typesOutputFile(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): OutputTextFile {
  // Group tokens by type
  const tokensByType = new Map<TokenType, Token[]>()
  tokens.forEach(token => {
    const currentTokens = tokensByType.get(token.tokenType) || []
    currentTokens.push(token)
    tokensByType.set(token.tokenType, currentTokens)
  })

  // Generate interface for each token type
  const interfaces = Array.from(tokensByType.entries()).map(([type, typeTokens]) => {
    const properties = typeTokens.map(token => {
      const name = tokenObjectKeyName(token, tokenGroups)
      if (token.description) {
        return `  /** ${token.description.trim()} */\n  ${name}: string;`
      }
      return `  ${name}: string;`
    }).join('\n')

    return `export interface ${type}Tokens {\n${properties}\n}`
  }).join('\n\n')

  const content = `// This file was generated automatically and should not be changed manually.

${interfaces}
`

  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: 'types.d.ts',
    content: content,
  })
} 