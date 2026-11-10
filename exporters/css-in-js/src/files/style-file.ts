import { FileHelper, CSSHelper, GeneralHelper, ThemeHelper, FileNameHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { tokenObjectKeyName, resetTokenNameTracking } from "../content/token"
import { TokenTheme } from "@supernovaio/sdk-exporters"
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"
import { formatTokenValue } from "../utils/value-formatter"

/** File name (without extension) for a given token type, honoring customizeStyleFileNames. */
function fileNameFor(type: TokenType): string {
  const raw = exportConfiguration.customizeStyleFileNames
    ? exportConfiguration.styleFileNames[type]
    : DEFAULT_STYLE_FILE_NAMES[type]
  return raw.replace(/\.ts$/, "")
}

/** Module specifier from the themed-file directory to a base file (no .ts extension). */
function relativeBaseImport(fromThemePath: string, fileNameWithoutExt: string): string {
  const rel = FileNameHelper.posixRelativeDir(fromThemePath, exportConfiguration.baseStyleFilePath)
  return `${rel}/${fileNameWithoutExt}`
}

/**
 * Returns the tokens that styleOutputFile would emit for the given type and theme,
 * or null if no file would be generated. Used as the single source of truth for
 * both the early return and for deciding which peer themed files import targets.
 */
function selectTokensForFile(
  type: TokenType,
  tokens: Array<Token>,
  themePath: string,
  theme?: TokenTheme,
): Array<Token> | null {
  if (!exportConfiguration.exportBaseValues && !themePath) return null
  let filtered = tokens.filter(t => t.tokenType === type)
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    filtered = ThemeHelper.filterThemedTokens(filtered, theme)
    if (filtered.length === 0) return null
  } else if (!exportConfiguration.generateEmptyFiles && filtered.length === 0) {
    return null
  }
  return filtered
}

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

  const tokensOfType = selectTokensForFile(type, tokens, themePath, theme)
  if (!tokensOfType) return null

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

  // IDs of tokens declared as `const`s in this file — same-type refs to these
  // can use the bare identifier instead of importing from another module
  const localTokenIds = new Set(tokensOfType.map(t => t.id))
  // Tokens that the theme overrides (only populated when generating themed files).
  const overriddenTokenIds = theme
    ? new Set(theme.overriddenTokens.map(o => o.id))
    : new Set<string>()

  // Token types whose peer themed file will exist alongside this one
  const peerThemedTypes = new Set<TokenType>()
  if (themePath && theme) {
    for (const t of Object.values(TokenType)) {
      if (t !== type && selectTokensForFile(t, tokens, themePath, theme) !== null) {
        peerThemedTypes.add(t)
      }
    }
  }

  // Imports collected during ref resolution: peer-themed (same theme dir) vs base
  const peerThemeImports = new Set<TokenType>()
  const baseImports = new Set<TokenType>()

  const constDeclarations = sortedForDeclarations.map(token => {
    const name = tokenObjectKeyName(token, tokenGroups, false)
    const value = CSSHelper.tokenToCSS(token, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: (t) => {
        const refName = tokenObjectKeyName(t, tokenGroups, false)

        // Same-type ref to a token declared in this file → bare identifier
        if (t.tokenType === type && localTokenIds.has(t.id)) {
          return `\${${refName}}`
        }

        // Cross-type ref where a peer themed file holds the target. With
        // exportOnlyThemedTokens=true the peer file only contains overrides, so the
        // target itself must be overridden; otherwise the peer file holds every token.
        if (themePath && t.tokenType !== type && peerThemedTypes.has(t.tokenType)) {
          const tokenIsInPeerFile = !exportConfiguration.exportOnlyThemedTokens
            || overriddenTokenIds.has(t.id)
          if (tokenIsInPeerFile) {
            peerThemeImports.add(t.tokenType)
            return `\${${t.tokenType}Tokens.${refName}}`
          }
        }

        // Fall back to importing from the base file. Same-type imports get a `Base`
        // alias to avoid colliding with this file's own `${type}Tokens` export
        if (exportConfiguration.exportBaseValues) {
          baseImports.add(t.tokenType)
          const alias = t.tokenType === type
            ? `Base${t.tokenType}Tokens`
            : `${t.tokenType}Tokens`
          return `\${${alias}.${refName}}`
        }

        // No base file to import from — inline the resolved value. allowReferences=false
        // makes CSSHelper recurse all the way to literals, so the result has no ${...}
        return CSSHelper.tokenToCSS(t, mappedTokens, {
          allowReferences: false,
          decimals: exportConfiguration.colorPrecision,
          colorFormat: exportConfiguration.colorFormat,
          forceRemUnit: exportConfiguration.forceRemUnit,
          remBase: exportConfiguration.remBase,
          tokenToVariableRef: () => "",
        })
      },
    })

    return `const ${name} = ${formatTokenValue(value)};`
  }).join('\n')

  // Peer-theme imports are siblings; base imports use a relative path and alias
  // same-type imports so they don't clash with this file's own export
  const peerThemeImportLines = Array.from(peerThemeImports).map(t => {
    return `import { ${t}Tokens } from "./${fileNameFor(t)}";`
  })
  const baseImportLines = Array.from(baseImports).map(t => {
    const aliased = t === type ? ` as Base${t}Tokens` : ""
    const importPath = relativeBaseImport(themePath, fileNameFor(t))
    return `import { ${t}Tokens${aliased} } from "${importPath}";`
  })
  const imports = [...peerThemeImportLines, ...baseImportLines].join('\n')

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