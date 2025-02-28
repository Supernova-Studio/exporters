import { FileHelper, CSSHelper, GeneralHelper, ThemeHelper, FileNameHelper, StringCase } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { DesignSystemCollection } from '@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection'
import { exportConfiguration } from ".."
import { tokenObjectKeyName, resetTokenNameTracking, getTokenPrefix } from "../content/token"
import { TokenTheme } from "@supernovaio/sdk-exporters"
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"
import { createHierarchicalStructure, deepMerge, processTokenName } from "../utils/token-hierarchy"
import { NamingHelper } from "@supernovaio/export-utils"
import { ThemeExportStyle, TokenNameStructure } from "../../config"

/**
 * Creates a value object for a token, either as a simple value or themed values
 */
function createTokenValue(
  value: string,
  token: Token,
  theme?: TokenTheme
): any {
  const baseValue = value.replace(/['"]/g, '')
  const description = token.description && exportConfiguration.showDescriptions 
    ? { description: token.description.trim() } 
    : {}
  
  // Get the token type, forcing a return value even when prefixes are disabled
  const tokenType = getTokenPrefix(token.tokenType, true)

  // For nested themes style, create an object with theme-specific values
  if (exportConfiguration.exportThemesAs === ThemeExportStyle.NestedThemes) {
    const valueObject = {}

    // Include base value only when processing base tokens (no theme)
    // This ensures base values only come from the base file
    if (!theme && exportConfiguration.exportBaseValues) {
      valueObject['base'] = {
        value: baseValue,
        type: tokenType
      }
    }

    // Add themed value if theme is provided
    if (theme) {
      valueObject[ThemeHelper.getThemeIdentifier(theme, StringCase.kebabCase)] = {
        value: baseValue,
        type: tokenType
      }
    }

    // Add description last
    return {
      ...valueObject,
      ...description
    }
  }

  // Default case - return simple value object with type
  return {
    value: baseValue,
    type: tokenType,
    ...description
  }
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
 * @param collections - Array of design system collections
 * @returns OutputTextFile with the generated content or null if no tokens exist
 */
export function styleOutputFile(
  type: TokenType,
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  themePath: string = '',
  theme?: TokenTheme,
  collections: Array<DesignSystemCollection> = []
): OutputTextFile | null {
  // Clear any previously cached token names to ensure clean generation
  resetTokenNameTracking()

  // Skip generating base token files unless:
  // - Base values are explicitly enabled via exportBaseValues, or
  // - We're generating themed files (themePath is present), or
  // - We're using nested themes format (which needs to generate files even without base values
  //   since it combines all theme values into a single file structure)
  if (!exportConfiguration.exportBaseValues && !themePath && 
      exportConfiguration.exportThemesAs !== ThemeExportStyle.NestedThemes) {
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

  // Sort tokens if configured
  let sortedTokens = [...tokensOfType]
  if (exportConfiguration.tokenSortOrder === 'alphabetical') {
    sortedTokens.sort((a, b) => {
      const nameA = tokenObjectKeyName(a, tokenGroups, true, collections)
      const nameB = tokenObjectKeyName(b, tokenGroups, true, collections)
      return nameA.localeCompare(nameB)
    })
  }

  // Generate the JSON structure
  const tokenObject: any = {}
  
  // Add disclaimer as _comment if enabled
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    tokenObject._comment = exportConfiguration.disclaimer
  }
  
  sortedTokens.forEach(token => {
    const name = tokenObjectKeyName(token, tokenGroups, true, collections)
    const value = CSSHelper.tokenToCSS(token, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: (t) => {
        // Build the full reference path
        const prefix = getTokenPrefix(t.tokenType)

        // Get path segments and include them based on structure type
        const pathSegments = (t.tokenPath || [])
          .filter(segment => segment && segment.trim().length > 0)
          .map(segment => NamingHelper.codeSafeVariableName(segment, exportConfiguration.tokenNameStyle))

        // Process the token name
        const tokenName = processTokenName(t, pathSegments)

        // Combine all segments based on structure type
        let segments: string[] = []
        if (prefix) {
          segments.push(prefix)
        }

        switch (exportConfiguration.tokenNameStructure) {
          case TokenNameStructure.NameOnly:
            segments.push(tokenName)
            break
            
          case TokenNameStructure.CollectionPathAndName:
            if (t.collectionId) {
              const collection = collections.find(c => c.persistentId === t.collectionId)
              if (collection) {
                const collectionSegment = NamingHelper.codeSafeVariableName(collection.name, exportConfiguration.tokenNameStyle)
                segments.push(collectionSegment)
              }
            }
            segments.push(...pathSegments, tokenName)
            break
            
          case TokenNameStructure.PathAndName:
            segments.push(...pathSegments, tokenName)
            break
        }

        // Add global prefix if configured
        if (exportConfiguration.globalNamePrefix) {
          segments.unshift(
            NamingHelper.codeSafeVariableName(
              exportConfiguration.globalNamePrefix, 
              exportConfiguration.tokenNameStyle
            )
          )
        }

        return `{${segments.join('.')}}`
      }
    })

    // Create hierarchical structure using the tracked name
    const hierarchicalObject = createHierarchicalStructure(
      token.tokenPath || [],
      token.name,
      createTokenValue(value, token, theme),
      token,
      collections
    )

    Object.assign(tokenObject, deepMerge(tokenObject, hierarchicalObject))
  })

  // Generate the final JSON content
  const content = JSON.stringify(tokenObject, null, exportConfiguration.indent)

  return FileHelper.createTextFile({
    relativePath: themePath ? `./${themePath}` : exportConfiguration.baseStyleFilePath,
    fileName: exportConfiguration.customizeStyleFileNames
      ? FileNameHelper.ensureFileExtension(exportConfiguration.styleFileNames[type], ".json")
      : DEFAULT_STYLE_FILE_NAMES[type],
    content: content
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
    if (token.description) {
      return `${indentString}/** ${token.description.trim()} */\n${indentString}${name},`
    }
    return `${indentString}${name},`
  }).join('\n')
}