import { FileHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { tokenObjectKeyName } from "../content/token"

/**
 * Generates TypeScript type definitions (types.d.ts) for all tokens.
 * This provides type safety and autocompletion when using the tokens.
 * 
 * The generated file includes:
 * - Type-specific interfaces (ColorTokens, TypographyTokens, etc.)
 * - Token descriptions as JSDoc comments
 * - A combined TokenObject type that matches the flat structure
 * 
 * @param tokens - Array of all tokens
 * @param tokenGroups - Array of token groups for name generation
 * @returns OutputTextFile with the generated type definitions
 */
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

  // Generate a flat type that includes all token properties
  const allProperties = tokens.map(token => {
    const name = tokenObjectKeyName(token, tokenGroups)
    if (token.description) {
      return `  /** ${token.description.trim()} */\n  ${name}: string;`
    }
    return `  ${name}: string;`
  }).join('\n')

  const content = `// This file was generated automatically and should not be changed manually.

// Type-specific interfaces
${interfaces}

// Combined flat token type
export interface TokenObject {
${allProperties}
}

// Default export type
export type { TokenObject as default };
`

  return FileHelper.createTextFile({
    relativePath: './',
    fileName: 'types.d.ts',
    content: content,
  })
} 