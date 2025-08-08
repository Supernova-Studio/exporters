import { FileHelper, CSSHelper, GeneralHelper, ThemeHelper, FileNameHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { tokenObjectKeyName, resetTokenNameTracking } from "../content/token"
import { TokenTheme } from "@supernovaio/sdk-exporters"
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"
import { formatTokenValue } from "../utils/value-formatter"

/**
 * Generates a TypeScript file for a specific token type (color.ts, typography.ts, etc.).
 * These files contain the actual token values and are typically consumed through the index files.
 * 
 * Features:
 * - Generates type-safe token exports
 * - Handles token references correctly
 * - Supports theming
 * - Includes token descriptions as comments
 * - Formats values according to configuration
 * 
 * @param type - The type of tokens to generate (Color, Typography, etc.)
 * @param tokens - Array of all tokens
 * @param tokenGroups - Array of token groups for name generation
 * @param themePath - Path for themed tokens (empty for base tokens)
 * @param theme - Theme configuration when generating themed tokens
 * @returns OutputTextFile with the generated content or null if no tokens exist
 */
export function styleOutputFile(
  type: TokenType,
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  themePath: string = '',
  theme?: TokenTheme
): OutputTextFile | null {
  // Clear any previously cached token names to ensure clean generation
  resetTokenNameTracking()

  // Skip generating base token files unless explicitly enabled or generating themed tokens
  if (!exportConfiguration.exportBaseValues && !themePath) {
    return null
  }

  // Filter to only include tokens of the specified type (color, size, etc)
  let tokensOfType = tokens.filter((token) => token.tokenType === type)

  // For themed token files:
  // - Filter to only include tokens that are overridden in this theme
  // - Skip generating the file if no tokens are themed (when configured)
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    tokensOfType = ThemeHelper.filterThemedTokens(tokensOfType, theme)
    
    if (tokensOfType.length === 0) {
      return null
    }
  }

  // Skip generating empty files unless explicitly configured to do so
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null
  }

  // Create a lookup map for quick token reference resolution
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  
  // Sort tokens to ensure proper declaration order:
  // - Tokens with direct values come first
  // - Tokens that reference other tokens come after
  // This prevents reference errors where a token tries to use another token that hasn't been declared yet
  const sortedForDeclarations = [...tokensOfType].sort((a, b) => {
    const aHasRef = !!(a as any)?.value?.referencedTokenId
    const bHasRef = !!(b as any)?.value?.referencedTokenId
    return aHasRef === bHasRef ? 0 : aHasRef ? 1 : -1
  })
  
  // Track token types that need to be imported when tokens reference other token types
  // For example, if a Shadow token references a Color token, we need to import ColorTokens
  const importsNeeded = new Set<string>()
  
  const constDeclarations = sortedForDeclarations.map(token => {
    const name = tokenObjectKeyName(token, tokenGroups, false)
    const value = CSSHelper.tokenToCSS(token, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: (t) => {
        const tokenRef = t.tokenType !== type
          ? `${t.tokenType}Tokens.${tokenObjectKeyName(t, tokenGroups, false)}`
          : tokenObjectKeyName(t, tokenGroups, false)

        if (t.tokenType !== type) {
          importsNeeded.add(t.tokenType)
        }

        return `\${${tokenRef}}`
      },
    })

    return `const ${name} = ${formatTokenValue(value)};`
  }).join('\n')

  // Generate import statements for any referenced token types
  // For example: import { ColorTokens } from "./color";
  const imports = Array.from(importsNeeded)
    .map(importType => {
      const fileName = exportConfiguration.customizeStyleFileNames
        ? exportConfiguration.styleFileNames[importType].replace('.ts', '')
        : DEFAULT_STYLE_FILE_NAMES[importType].replace('.ts', '')
      return `import { ${importType}Tokens } from "./${fileName}";`
    })
    .join('\n')

  // Generate the exported object
  const objectProperties = generateTokenObject(tokensOfType, tokenGroups)

  let content = imports
  if (imports) content += '\n\n'
  content += constDeclarations
  content += `\n\nexport const ${type}Tokens = {\n${objectProperties}\n}`

  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
  }

  // Create and return a text file containing the generated token styles
  return FileHelper.createTextFile({
    relativePath: themePath ? `./${themePath}` : exportConfiguration.baseStyleFilePath,
    fileName: exportConfiguration.customizeStyleFileNames
      ? FileNameHelper.ensureFileExtension(exportConfiguration.styleFileNames[type], ".ts")
      : DEFAULT_STYLE_FILE_NAMES[type],
    content: content,
  })
}

/**
 * Generates the content of the exported token object.
 * This object provides a type-safe way to access token values through their generated names.
 * 
 * Features:
 * - Maintains token grouping structure
 * - Includes token descriptions as JSDoc comments
 * - Supports alphabetical sorting when configured
 * - Properly indents according to configuration
 * 
 * @param tokens - Array of tokens to include in the object
 * @param tokenGroups - Array of token groups for maintaining hierarchy
 * @returns Formatted string containing the object's properties
 */
function generateTokenObject(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
  const indentString = GeneralHelper.indent(exportConfiguration.indent)
  
  // Create a copy of tokens array for sorting
  let sortedTokens = [...tokens]
  
  // Sort tokens alphabetically if configured
  // This can make it easier to find tokens in the generated files
  if (exportConfiguration.tokenSortOrder === 'alphabetical') {
    sortedTokens.sort((a, b) => {
      const nameA = tokenObjectKeyName(a, tokenGroups, true)
      const nameB = tokenObjectKeyName(b, tokenGroups, true)
      return nameA.localeCompare(nameB)
    })
  }

  // Generate the object properties, including descriptions as JSDoc comments
  return sortedTokens.map(token => {
    const name = tokenObjectKeyName(token, tokenGroups, true)
    if (exportConfiguration.showDescriptions && token.description) {
      return `${indentString}/** ${token.description.trim()} */\n${indentString}${name},`
    }
    return `${indentString}${name},`
  }).join('\n')
}