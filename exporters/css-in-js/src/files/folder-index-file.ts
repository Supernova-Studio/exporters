import { FileHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"

/**
 * Generates an index.ts file for a specific theme or base folder that combines all token types
 * into a single, flat object structure. This allows for simpler token access like:
 * ```typescript
 * import { base, dark } from './tokens'
 * console.log(base.primary) // Access color token directly
 * ```
 * 
 * The generated file:
 * 1. Imports all token types (color.ts, typography.ts, etc.)
 * 2. Spreads them into a single object for flat access
 * 3. Exports this object as the default export
 * 
 * @param tokens - Array of all tokens for this theme/base
 * @param folderPath - Path where the index file should be generated
 * @returns OutputTextFile with the generated index content
 */
export function folderIndexOutputFile(tokens: Array<Token>, folderPath: string): OutputTextFile {
  // Group all tokens by their type (Color, Typography, etc.) for efficient processing
  // This creates a map where each type points to an array of its tokens
  const tokensByType = tokens.reduce((acc, token) => {
    if (!acc[token.tokenType]) {
      acc[token.tokenType] = []
    }
    acc[token.tokenType].push(token)
    return acc
  }, {} as Record<TokenType, Token[]>)

  // Prepare arrays to collect import statements and token spreads
  const imports: string[] = []
  const exports: string[] = []

  // Process each token type that has tokens
  Object.entries(tokensByType).forEach(([type, typeTokens]) => {
    // Skip empty token types to keep the generated file clean
    if (typeTokens.length === 0) return

    // Get the correct filename for this token type, respecting custom file names if configured
    const fileName = exportConfiguration.customizeStyleFileNames
      ? exportConfiguration.styleFileNames[type].replace('.css', '').replace('.ts', '')
      : DEFAULT_STYLE_FILE_NAMES[type].replace('.css', '').replace('.ts', '')

    // Add import for this token type's file
    imports.push(`import { ${type}Tokens } from "./${fileName}";`)
    // Spread all tokens from this type into the final object
    exports.push(`  ...${type}Tokens,`)
  })

  // Combine everything into the final file content:
  // 1. All imports
  let content = imports.join('\n') + '\n\n'
  // 2. The tokens object that spreads all token types
  content += `const tokens = {\n${exports.join('\n')}\n};\n\n`
  // 3. Default export for easy importing
  content += `export default tokens;\n`

  // Add the file disclaimer if configured
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = `/**\n * ${exportConfiguration.disclaimer.replace(/\n/g, '\n * ')} \n*/\n\n${content}`
  }

  return FileHelper.createTextFile({
    relativePath: folderPath,
    fileName: 'index.ts',
    content: content
  })
} 