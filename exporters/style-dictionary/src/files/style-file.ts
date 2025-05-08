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
import { createTypographyObject } from "./../utils/typography-formatter"


/**
 * Creates a value object for a token, either as a simple value or themed values
 */
function createTokenValue(
  value: string,
  token: Token,
  theme?: TokenTheme,
  mappedTokens?: Map<string, Token>
): any {
  const baseValue = value.replace(/['"]/g, '')
  const description = token.description && exportConfiguration.showDescriptions 
    ? { description: token.description.trim() } 
    : {}
  
  // Get the token type, forcing a return value even when prefixes are disabled
  const tokenType = getTokenPrefix(token.tokenType, true)

  const isTypography = token.tokenType === TokenType.typography
  const updatedBaseValue = isTypography && mappedTokens 
    ? createTypographyObject(token, mappedTokens)
    : baseValue

  // For nested themes style, create an object with theme-specific values  
  if (exportConfiguration.exportThemesAs === ThemeExportStyle.NestedThemes) {
    const valueObject = {}

    // Include base value only when processing base tokens (no theme)
    // This ensures base values only come from the base file
    if (!theme && exportConfiguration.exportBaseValues) {
      valueObject['base'] = {
        value: updatedBaseValue,
        type: tokenType
      }
    }

    // Add themed value if theme is provided
    if (theme) {
      valueObject[ThemeHelper.getThemeIdentifier(theme, StringCase.kebabCase)] = {
        value: updatedBaseValue,
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
    value: updatedBaseValue,
    type: tokenType,
    ...description
  }
}

/**
 * Core token processing function that handles the transformation of tokens into a structured object.
 * This function encapsulates the shared logic between single-file and separate-file outputs.
 * 
 * Features:
 * - Handles token name tracking and uniqueness
 * - Processes token values and references
 * - Manages token sorting
 * - Creates hierarchical object structure
 * - Handles theme-specific values
 * - Includes token descriptions and comments
 * - Formats values according to configuration
 * 
 * @param tokens - Array of tokens to process
 * @param tokenGroups - Array of token groups for maintaining hierarchy
 * @param theme - Optional theme configuration for themed tokens
 * @param collections - Array of design system collections for collection-based organization
 * @param allTokens - Optional array of all available tokens for reference resolution
 * @returns Structured object containing processed tokens, or null if no output should be generated
 */
function processTokensToObject(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  theme?: TokenTheme,
  collections: Array<DesignSystemCollection> = [],
  allTokens?: Array<Token>
): any | null {
  // Clear any previously cached token names to ensure clean generation
  resetTokenNameTracking()

  // Skip generating empty files unless explicitly configured to do so
  if (!exportConfiguration.generateEmptyFiles && tokens.length === 0) {
    return null
  }

  // Create a lookup map for quick token reference resolution using all tokens
  // This ensures that references to tokens outside the current filtered set still work
  const mappedTokens = new Map((allTokens || tokens).map((token) => [token.id, token]))

  // Sort tokens if configured
  // This can make it easier to find tokens in the generated files
  let sortedTokens = [...tokens]
  if (exportConfiguration.tokenSortOrder === 'alphabetical') {
    sortedTokens.sort((a, b) => {
      const nameA = tokenObjectKeyName(a, tokenGroups, true, collections)
      const nameB = tokenObjectKeyName(b, tokenGroups, true, collections)
      return nameA.localeCompare(nameB)
    })
  }

  // Initialize the root object that will contain all processed tokens
  const tokenObject: any = {}
  
  // Add generated file disclaimer if enabled
  // This helps users understand that the file is auto-generated
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    tokenObject._comment = exportConfiguration.disclaimer
  }
  
  // Process each token and build the hierarchical structure
  for (const token of sortedTokens) {
    // Generate the token's object key name based on configuration
    const name = tokenObjectKeyName(token, tokenGroups, true, collections)

    // Convert token to CSS-compatible value, handling references and formatting
    const value = CSSHelper.tokenToCSS(token, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: (t) => {
        // Build the reference path based on token structure configuration
        const prefix = getTokenPrefix(t.tokenType)
        const pathSegments = (t.tokenPath || [])
          .filter(segment => segment && segment.trim().length > 0)
          .map(segment => NamingHelper.codeSafeVariableName(segment, exportConfiguration.tokenNameStyle))

        const tokenName = processTokenName(t, pathSegments)

        // Build segments array based on configuration
        let segments: string[] = []
        if (prefix) {
          segments.push(prefix)
        }

        // Handle different token name structure configurations
        switch (exportConfiguration.tokenNameStructure) {
          case TokenNameStructure.NameOnly:
            segments.push(tokenName)
            break
            
          case TokenNameStructure.CollectionPathAndName:
            // Include collection name in the path if available
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

    // Create the hierarchical object structure for this token
    const hierarchicalObject = createHierarchicalStructure(
      token.tokenPath || [],
      token.name,
      createTokenValue(value, token, theme, mappedTokens),
      token,
      collections
    )

    // Merge the token's object structure into the main object
    Object.assign(tokenObject, deepMerge(tokenObject, hierarchicalObject))
  }

  return tokenObject
}

/**
 * Generates a style file for a specific token type (color.json, typography.json, etc.).
 * This function is used when fileStructure is set to 'separateByType'.
 * 
 * Features:
 * - Generates separate files for each token type
 * - Handles token filtering by type
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
  // Skip generating base token files unless:
  // - Base values are explicitly enabled via exportBaseValues, or
  // - We're generating themed files (themePath is present), or
  // - We're using nested themes format
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

  // Process tokens into a structured object
  // Pass the full tokens array for reference resolution
  const tokenObject = processTokensToObject(tokensOfType, tokenGroups, theme, collections, tokens)
  if (!tokenObject) {
    return null
  }

  // Generate the final JSON content with proper indentation
  const content = JSON.stringify(tokenObject, null, exportConfiguration.indent)

  // Create and return the output file with appropriate path and name
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

/**
 * Generates a single combined JSON file containing all token types.
 * This function is used when fileStructure is set to 'singleFile'.
 * 
 * Features:
 * - Combines all token types into a single file
 * - Maintains token type grouping in the output
 * - Supports theming
 * - Includes token descriptions
 * - Places files directly in root with theme-based names
 * 
 * Output structure examples:
 * - No themes: tokens.json
 * - Separate theme files: tokens.json, tokens.light.json, tokens.dark.json
 * - Merged themes: tokens.json, tokens.themed.json
 * - Nested themes: tokens.json (with all themes nested inside)
 * 
 * @param tokens - Array of all tokens
 * @param tokenGroups - Array of token groups for hierarchy
 * @param themePath - Optional theme path for themed files
 * @param theme - Optional theme configuration
 * @param collections - Array of design system collections
 * @returns OutputTextFile with the combined content or null if no output should be generated
 */
export function combinedStyleOutputFile(
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  themePath: string = '',
  theme?: TokenTheme,
  collections: Array<DesignSystemCollection> = []
): OutputTextFile | null {
  // Skip generating base token files unless:
  // - Base values are explicitly enabled via exportBaseValues, or
  // - We're generating themed files (themePath is present), or
  // - We're using nested themes format
  if (!exportConfiguration.exportBaseValues && !themePath && 
      exportConfiguration.exportThemesAs !== ThemeExportStyle.NestedThemes) {
    return null
  }

  // Store original tokens for reference resolution
  const originalTokens = [...tokens]

  // For themed token files:
  // - Filter to only include tokens that are overridden in this theme
  // - Skip generating the file if no tokens are themed (when configured)
  if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
    tokens = ThemeHelper.filterThemedTokens(tokens, theme)
    
    if (tokens.length === 0) {
      return null
    }
  }

  // Process all tokens into a single structured object
  // Pass the original tokens array for reference resolution
  const tokenObject = processTokensToObject(tokens, tokenGroups, theme, collections, originalTokens)
  if (!tokenObject) {
    return null
  }

  // Generate the final JSON content with proper indentation
  const content = JSON.stringify(tokenObject, null, exportConfiguration.indent)

  // For single file mode, themed files go directly in root with theme-based names
  const fileName = themePath ? `tokens.${themePath}.json` : 'tokens.json'
  const relativePath = './' // Put files directly in root folder

  // Create and return the output file
  return FileHelper.createTextFile({
    relativePath: relativePath,
    fileName: fileName,
    content: content
  })
}
