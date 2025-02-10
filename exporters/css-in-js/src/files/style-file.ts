import { FileHelper, CSSHelper } from "@supernovaio/export-utils"
import {  OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { tokenObjectKeyName, resetTokenNameTracking } from "../content/token"
import { TokenTheme } from "@supernovaio/sdk-exporters"
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"
import { formatTokenValue } from "../utils/value-formatter"

// For now, let's move the theme helper functions directly into the file until utils is updated
function filterThemedTokens(tokens: Array<Token>, theme: TokenTheme): Array<Token> {
  const overriddenTokenIds = new Set(theme.overriddenTokens.map(t => t.id))
  return tokens.filter(token => overriddenTokenIds.has(token.id))
}

function getThemePath(theme: TokenTheme | string): string {
  return typeof theme === 'string' ? theme : theme.name.toLowerCase()
}

export function styleOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): OutputTextFile | null {
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
    tokensOfType = filterThemedTokens(tokensOfType, theme)
    
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
  
  // Sort tokens to ensure referenced tokens are declared after their dependencies
  // This prevents using variables before they're defined
  const sortedForDeclarations = [...tokensOfType].sort((a, b) => {
    const aHasRef = !!(a as any)?.value?.referencedTokenId
    const bHasRef = !!(b as any)?.value?.referencedTokenId
    return aHasRef === bHasRef ? 0 : aHasRef ? 1 : -1
  })
  
  // Track which token types we need to import (for cross-type token references)
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

  // Generate imports if needed
  const imports = Array.from(importsNeeded)
    .map(importType => {
      const fileName = exportConfiguration.customizeStyleFileNames
        ? exportConfiguration.styleFileNames[importType].replace('.css', '')
        : DEFAULT_STYLE_FILE_NAMES[importType].replace('.css', '')
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
    content = `/**\n * ${exportConfiguration.disclaimer.replace(/\n/g, '\n * ')} \n*/\n\n${content}`
  }

  // Return proper OutputTextFile object
  return FileHelper.createTextFile({
    relativePath: themePath ? `./${themePath}` : exportConfiguration.baseStyleFilePath,
    fileName: exportConfiguration.customizeStyleFileNames
      ? exportConfiguration.styleFileNames[type].replace('.css', '.ts')
      : DEFAULT_STYLE_FILE_NAMES[type].replace('.css', '.ts'),
    content: content,
  })
}

function generateTokenObject(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
  return tokens.map(token => {
    const name = tokenObjectKeyName(token, tokenGroups, true)
    if (token.description) {
      return `  /** ${token.description.trim()} */\n  ${name},`
    }
    return `  ${name},`
  }).join('\n')
}