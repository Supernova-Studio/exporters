/**
 * This file contains functions for generating Tailwind CSS files from design tokens.
 * It handles the creation of style files, reset files, and index files based on the export configuration.
 */

import { FileHelper, ThemeHelper, GeneralHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { FileStructure } from "../../config"
import { convertedToken, isAllowedTokenType } from "../content/token"
import { generateTypographyClass } from "../content/typography"
import { DEFAULT_CONFIG_FILE_NAMES } from "../constants/defaults"

/**
 * Processes tokens based on theme settings and filters
 * This function filters tokens based on theme settings and ensures only allowed token types are included
 *
 * @param tokens - Array of tokens to process
 * @param themePath - Path of the theme (if applicable)
 * @param theme - Theme object (if applicable)
 * @returns Filtered array of tokens
 */
function processTokens(tokens: Array<Token>, themePath: string = '', theme?: TokenTheme): Array<Token> {
    // Skip if no tokens and empty files are disabled
    if (!exportConfiguration.generateEmptyFiles && tokens.length === 0) {
        return []
    }

    // For theme files: filter tokens to only include those that are themed
    let processedTokens = tokens
    if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
        processedTokens = ThemeHelper.filterThemedTokens(tokens, theme)
        if (processedTokens.length === 0) {
            return []
        }
    }

    // Filter out tokens not allowed for Tailwind customization
    processedTokens = processedTokens.filter(token => isAllowedTokenType(token.tokenType))
    return processedTokens
}

/**
 * Generates debug information for the file
 * This function creates debug comments that include information about the export process
 *
 * @param themePath - Path of the theme (if applicable)
 * @param tokenCount - Number of tokens in the file
 * @param tokenTypes - Array of token types included in the file
 * @param type - Specific token type (if applicable)
 * @returns Debug information as a string
 */
function generateDebugInfo(themePath: string = '', tokenCount: number, tokenTypes: Array<string> = [], type?: TokenType): string {
    if (!exportConfiguration.debug) return ''

    let content = `/* Debug Information\n`
    content += ` * Exporter: Tailwind CSS by Supernova\n`
    content += ` * Theme: ${themePath || 'Base'}\n`
    if (type) {
        content += ` * Token Type: ${type}\n`
    }
    content += ` * Token Count: ${tokenCount}\n`
    if (tokenTypes.length > 0) {
        content += ` * Token Types: ${tokenTypes.join(', ')}\n`
    }
    content += ` * Color Format: ${exportConfiguration.colorFormat}\n`
    content += ` * Prefix: ${exportConfiguration.globalPrefix || 'None'}\n`

    if (!type && exportConfiguration.useColorUtilityPrefixes) {
        content += ` * Color Utility Prefixes:\n`
        for (const [utilityName, patterns] of Object.entries(exportConfiguration.colorUtilityPrefixes)) {
            const patternArray = (patterns as string).split(',').map(p => p.trim())
            content += `    - ${utilityName}: ${patternArray.join(', ')}\n`
        }
    } else {
        content += ` * Color Utility Prefixes: Disabled\n`
    }

    content += ` * Generated: ${new Date().toISOString()}\n`
    content += ` */\n\n`
    return content
}

/**
 * Checks if any Tailwind styles are disabled in the configuration
 *
 * @returns boolean indicating if any styles are disabled
 */
function shouldDisableDefaultTailwindConfiguration(): boolean {
    return exportConfiguration.disableAllDefaults ||
           exportConfiguration.disableAnimateDefaults ||
           exportConfiguration.disableBlurDefaults ||
           exportConfiguration.disableBorderRadiusDefaults ||
           exportConfiguration.disableBreakpointDefaults ||
           exportConfiguration.disableColorDefaults ||
           exportConfiguration.disableContainerDefaults ||
           exportConfiguration.disableDropShadowDefaults ||
           exportConfiguration.disableFontDefaults ||
           exportConfiguration.disableFontWeightDefaults ||
           exportConfiguration.disableInsetDefaults ||
           exportConfiguration.disableLeadingDefaults ||
           exportConfiguration.disablePerspectiveDefaults ||
           exportConfiguration.disableShadowDefaults ||
           exportConfiguration.disableSpacingDefaults ||
           exportConfiguration.disableTextDefaults ||
           exportConfiguration.disableTrackingDefaults;
}

/**
 * Generates reset rules for Tailwind configuration
 * This function creates CSS reset rules based on the disabled styles configuration
 *
 * @param selector - CSS selector to apply the reset rules to
 * @returns CSS reset rules as a string
 */
function generateResetRules(selector: string): string {
    if (!shouldDisableDefaultTailwindConfiguration() && selector !== '@theme') return ''

    const indentString = GeneralHelper.indent(exportConfiguration.indent)
    const resetRules: string[] = []

    if (exportConfiguration.disableAllDefaults) {
        resetRules.push('--*: initial;')
    } else {
        if (exportConfiguration.disableAnimateDefaults) resetRules.push('--animate-*: initial;')
        if (exportConfiguration.disableBlurDefaults) resetRules.push('--blur-*: initial;')
        if (exportConfiguration.disableBorderRadiusDefaults) resetRules.push('--radius-*: initial;')
        if (exportConfiguration.disableBreakpointDefaults) resetRules.push('--breakpoint-*: initial;')
        if (exportConfiguration.disableColorDefaults) resetRules.push('--color-*: initial;')
        if (exportConfiguration.disableContainerDefaults) resetRules.push('--container-*: initial;')
        if (exportConfiguration.disableDropShadowDefaults) resetRules.push('--drop-shadow-*: initial;')
        if (exportConfiguration.disableFontDefaults) resetRules.push('--font-*: initial;')
        if (exportConfiguration.disableFontWeightDefaults) resetRules.push('--font-weight-*: initial;')
        if (exportConfiguration.disableInsetDefaults) resetRules.push('--inset-*: initial;')
        if (exportConfiguration.disableLeadingDefaults) resetRules.push('--leading-*: initial;')
        if (exportConfiguration.disablePerspectiveDefaults) resetRules.push('--perspective-*: initial;')
        if (exportConfiguration.disableShadowDefaults) resetRules.push('--shadow-*: initial;')
        if (exportConfiguration.disableSpacingDefaults) resetRules.push('--spacing-*: initial;')
        if (exportConfiguration.disableTextDefaults) resetRules.push('--text-*: initial;')
        if (exportConfiguration.disableTrackingDefaults) resetRules.push('--tracking-*: initial;')
    }

    if (resetRules.length > 0) {
        return `\n${indentString}/* Reset default Tailwind configuration */\n${indentString}${resetRules.join(`\n${indentString}`)}\n`
    }

    return ''
}

/**
 * Generates typography classes for typography tokens
 * This function creates CSS classes for typography tokens based on the configuration
 *
 * @param tokens - Array of tokens to process
 * @param tokenGroups - Array of token groups
 * @returns Typography classes as a string
 */
function generateTypographyContent(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
    if (!exportConfiguration.generateTypographyClasses) return ''

    const typographyTokens = tokens.filter(token => token.tokenType === TokenType.typography)
    if (typographyTokens.length === 0) return ''

    let content = '\n@layer components {\n'
    typographyTokens.forEach(token => {
        const classContent = generateTypographyClass(token, tokenGroups)
        if (classContent) {
            content += classContent
        }
    })
    content += '}\n'

    return content
}

/**
 * Generates typography utility classes for typography tokens
 * This function creates CSS classes for typography tokens based on the configuration
 *
 * @param tokens - Array of tokens to process
 * @param tokenGroups - Array of token groups
 * @returns Typography classes as a string
 */
function generateTypographyUtility(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
    if (!exportConfiguration.generateTypographyUtility) return ''

    const typographyTokens = tokens.filter(token => token.tokenType === TokenType.typography)
    if (typographyTokens.length === 0) return ''

    let content = '\n'
    typographyTokens.forEach(token => {
        const classContent = generateTypographyClass(token, tokenGroups, '@utility ')
        if (classContent) {
            content += classContent
        }
    })
    content += '\n'

    return content
}

/**
 * Generates CSS variables for tokens
 * This function creates CSS variable declarations for tokens based on their type
 *
 * @param tokens - Array of tokens to process
 * @param mappedTokens - Map of tokens by ID for reference resolution
 * @param tokenGroups - Array of token groups
 * @param type - Specific token type (if applicable)
 * @returns CSS variable declarations as a string
 */
function generateCSSVariables(
    tokens: Array<Token>,
    mappedTokens: Map<string, Token>,
    tokenGroups: Array<TokenGroup>,
    type?: TokenType
): string {
    const indentString = GeneralHelper.indent(exportConfiguration.indent)
    let cssVariables = ''

    // Group tokens by type if not already filtered
    const tokensByType = new Map<TokenType, Token[]>()
    if (!type) {
        tokens.forEach(token => {
            const tokenType = token.tokenType
            if (!tokensByType.has(tokenType)) {
                tokensByType.set(tokenType, [])
            }
            tokensByType.get(tokenType)!.push(token)
        })
    } else {
        tokensByType.set(type, tokens)
    }

    // Generate CSS variables for all token types
    tokensByType.forEach((tokensOfType, tokenType) => {
        // Add section comment for token type
        cssVariables += `\n${indentString}/* ${tokenType} */\n`

        // Add debug count information if debug is enabled
        if (exportConfiguration.debug) {
            cssVariables += `${indentString}/* ${tokensOfType.length} ${tokenType} tokens */\n`
        }

        // Convert tokens to CSS variable declarations
        const cssDeclarations = tokensOfType
            .map((token) => convertedToken(token, mappedTokens, tokenGroups))
            .filter((declaration): declaration is string => declaration !== null) // Filter out null returns
            .join("\n")

        cssVariables += cssDeclarations + "\n"
    })

    return cssVariables
}

/**
 * Gets the filename for a token type based on configuration or defaults
 * This function determines the appropriate filename for a token type based on the configuration
 *
 * @param type - Token type to get the filename for
 * @returns Filename for the token type
 */
function getStyleFileName(type: TokenType): string {
    let fileName = exportConfiguration.customizeConfigFileNames
        ? exportConfiguration.configFileNames[type] || DEFAULT_CONFIG_FILE_NAMES[type]
        : DEFAULT_CONFIG_FILE_NAMES[type]

    // Ensure proper .css extension
    if (!fileName.toLowerCase().endsWith('.css')) {
        fileName += '.css'
    }

    return fileName
}

/**
 * Generates a single CSS output file containing all token styles in Tailwind format
 * This function creates a single CSS file with all token styles when using SingleFile structure
 *
 * @param tokens - Array of tokens to process
 * @param tokenGroups - Array of token groups
 * @param themePath - Path of the theme (if applicable)
 * @param theme - Theme object (if applicable)
 * @returns OutputTextFile object or null if no tokens
 */
export function styleOutputFile(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): OutputTextFile | null {
    // Create a map of all tokens by ID for reference resolution
    // This includes ALL tokens to ensure references can be resolved, even to non-themed tokens
    const mappedTokens = new Map(tokens.map((token) => [token.id, token]))

    // Process tokens to get only themed ones if needed
    const processedTokens = processTokens(tokens, themePath, theme)
    if (processedTokens.length === 0) {
        return null
    }

    // Start with Tailwind import with prefix if configured, but only for base file
    let content = ''
    if (!themePath) {
        content = exportConfiguration.globalPrefix
            ? `@import "tailwindcss" prefix(${exportConfiguration.globalPrefix});\n\n`
            : '@import "tailwindcss";\n\n'
    }

    // Add debug information
    content += generateDebugInfo(
        themePath,
        processedTokens.length,
        Array.from(new Set(processedTokens.map(t => t.tokenType)))
    )

    // Use configured selector for base tokens or theme selector for themed tokens
    const selector = themePath && theme
        ? exportConfiguration.themeSelector.replace('{theme}', themePath)
        : exportConfiguration.cssSelector

    // Generate CSS variables
    let cssVariables = ''

    // Include reset rules in the main file if not using separate per type structure
    if (exportConfiguration.fileStructure !== FileStructure.SeparateByType) {
        cssVariables += generateResetRules(selector)
    }

    cssVariables += generateCSSVariables(processedTokens, mappedTokens, tokenGroups)

    // Check if any tokens use references and if references are enabled
    const hasReferences = exportConfiguration.useReferences && processedTokens.some(token =>
        // @ts-ignore
        token.value.referencedTokenId && token.value.referencedTokenId !== null && token.value.referencedTokenId !== undefined
    )

    // Add inline flag for @theme if it's the base selector and there are references
    const themeDirective = selector === '@theme' && hasReferences ? '@theme inline' : selector
    content += `${themeDirective} {\n${cssVariables}}\n`

    // Add typography classes
    content += generateTypographyContent(processedTokens, tokenGroups)

    // Add disclaimer if enabled
    if (exportConfiguration.showGeneratedFileDisclaimer) {
        content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
    }

    // Create and return the output file
    const fileName = themePath ? `tailwind.${themePath}.css` : "tailwind.css"

    return FileHelper.createTextFile({
        relativePath: "./",
        fileName: fileName,
        content: content,
    })
}

/**
 * Generates separate CSS output files for each token type in Tailwind format
 * This function creates separate CSS files for each token type when using SeparateByType structure
 *
 * @param tokens - Array of tokens to process
 * @param tokenGroups - Array of token groups
 * @param themePath - Path of the theme (if applicable)
 * @param theme - Theme object (if applicable)
 * @returns Array of OutputTextFile objects
 */
export function generateStyleFiles(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): Array<OutputTextFile> {
    // Create a map of all tokens by ID for reference resolution
    // This includes ALL tokens to ensure references can be resolved, even to non-themed tokens
    const mappedTokens = new Map(tokens.map((token) => [token.id, token]))

    // Process tokens to get only themed ones if needed
    const processedTokens = processTokens(tokens, themePath, theme)
    if (processedTokens.length === 0) {
        return []
    }

    // Group tokens by type
    const tokensByType = new Map<TokenType, Token[]>()
    processedTokens.forEach(token => {
        const type = token.tokenType
        if (!tokensByType.has(type)) {
            tokensByType.set(type, [])
        }
        tokensByType.get(type)!.push(token)
    })

    // Use configured selector for base tokens or theme selector for themed tokens
    const selector = themePath && theme
        ? exportConfiguration.themeSelector.replace('{theme}', themePath)
        : exportConfiguration.cssSelector

    // Check if any tokens use references and if references are enabled
    const hasReferences = exportConfiguration.useReferences && processedTokens.some(token =>
        // @ts-ignore
        token.value.referencedTokenId && token.value.referencedTokenId !== null && token.value.referencedTokenId !== undefined
    )

    // Add inline flag for @theme if it's the base selector and there are references
    const themeDirective = selector === '@theme' && hasReferences ? '@theme inline' : selector

    // Generate a file for each token type
    return Array.from(tokensByType.entries()).map(([type, tokensOfType]) => {
        // Skip if no tokens of this type and empty files are disabled
        if (!exportConfiguration.generateEmptyConfigTypeFiles && tokensOfType.length === 0) {
            return null
        }

        // Start with Tailwind import with prefix if configured, but only for base file
        let content = ''
        if (!themePath) {
            content = exportConfiguration.globalPrefix
                ? `@import "tailwindcss" prefix(${exportConfiguration.globalPrefix});\n\n`
                : '@import "tailwindcss";\n\n'
        }

        // Add debug information
        content += generateDebugInfo(themePath, tokensOfType.length, [], type)

        // Generate CSS variables
        let cssVariables = ''
        cssVariables += generateCSSVariables(tokensOfType, mappedTokens, tokenGroups, type)

        // Add the CSS variables to the content
        content += `${themeDirective} {\n${cssVariables}}\n`

        // Add typography classes if this is the typography type
        if (type === TokenType.typography) {
            content += generateTypographyContent(tokensOfType, tokenGroups)
        }

        // Add disclaimer if enabled
        if (exportConfiguration.showGeneratedFileDisclaimer) {
            content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
        }

        // Get the filename based on configuration or defaults
        const fileName = getStyleFileName(type)

        // Set the relative path based on whether this is a theme file or base file
        let relativePath = "./"
        if (themePath) {
            // For theme files, put them in a folder named after the theme
            relativePath = `./${themePath}/`
        } else if (exportConfiguration.fileStructure === FileStructure.SeparateByType) {
            // For base files in separateByType mode, use the configured baseStyleFilePath
            relativePath = exportConfiguration.baseStyleFilePath.endsWith('/')
                ? exportConfiguration.baseStyleFilePath
                : `${exportConfiguration.baseStyleFilePath}/`
        }

        // Create and return the output file
        return FileHelper.createTextFile({
            relativePath: relativePath,
            fileName: fileName,
            content: content,
        })
    }).filter((file): file is OutputTextFile => file !== null)
}

/**
 * Generates a separate reset.css file with Tailwind reset rules
 * This function creates a separate reset.css file when using SeparateByType structure
 * and when any Tailwind styles are disabled
 *
 * @returns OutputTextFile object or null if no reset rules needed
 */
export function resetOutputFile(): OutputTextFile | null {
    // Only generate reset file if file structure is separate per type
    if (exportConfiguration.fileStructure !== FileStructure.SeparateByType) {
        return null
    }

    if (!shouldDisableDefaultTailwindConfiguration()) {
        return null
    }

    let content = ''

    // Add debug information if enabled
    if (exportConfiguration.debug) {
        content += `/* Debug Information\n`
        content += ` * Exporter: Tailwind CSS by Supernova\n`
        content += ` * File: Reset\n`
        content += ` * Generated: ${new Date().toISOString()}\n`
        content += ` */\n\n`
    }

    // Generate reset rules
    const resetRules = generateResetRules(exportConfiguration.cssSelector)

    if (resetRules) {
        content += `${exportConfiguration.cssSelector} {\n${resetRules}}\n`
    }

    // Add disclaimer if enabled
    if (exportConfiguration.showGeneratedFileDisclaimer) {
        content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
    }

    // Create and return the output file
    return FileHelper.createTextFile({
        relativePath: "./",
        fileName: "reset.css",
        content: content,
    })
}

/**
 * Generates an index file that imports all token style files and theme variations
 * This function creates an index.css file that imports all generated CSS files
 *
 * @param tokens - Array of tokens to process
 * @param themes - Array of themes to include
 * @returns OutputTextFile object or null if index file generation is disabled
 */
export function indexOutputFile(tokens: Array<Token>, themes: Array<TokenTheme | string> = []): OutputTextFile | null {
    if (!exportConfiguration.generateIndexFile) {
        return null
    }

    let content = ''

    // Add debug information if enabled
    if (exportConfiguration.debug) {
        content += `/* Debug Information\n`
        content += ` * Exporter: Tailwind CSS by Supernova\n`
        content += ` * File: Index\n`
        content += ` * Generated: ${new Date().toISOString()}\n`
        content += ` */\n\n`
    }

    // Import reset file if it exists and file structure is separate per type
    if (exportConfiguration.fileStructure === FileStructure.SeparateByType && shouldDisableDefaultTailwindConfiguration()) {
        content += `@import "./reset.css";\n\n`
    }

    // Import base token files if they exist
    if (exportConfiguration.exportBaseValues) {
        if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
            content += `@import "./tailwind.css";\n`
        } else {
            // Import separate type files from base folder
            const tokenTypes = Array.from(new Set(tokens.map(t => t.tokenType)))
                .filter(type => isAllowedTokenType(type))

            tokenTypes.forEach(type => {
                const fileName = getStyleFileName(type)
                const basePath = exportConfiguration.baseStyleFilePath.endsWith('/')
                    ? exportConfiguration.baseStyleFilePath
                    : `${exportConfiguration.baseStyleFilePath}/`
                content += `@import "${basePath}${fileName}";\n`
            })
        }
    }

    // Import theme files
    themes.forEach(theme => {
        const themePath = typeof theme === 'string' ? theme : ThemeHelper.getThemeIdentifier(theme)
        if (exportConfiguration.fileStructure === FileStructure.SingleFile) {
            content += `@import "./tailwind.${themePath}.css";\n`
        } else {
            // Import separate theme type files
            const tokenTypes = Array.from(new Set(tokens.map(t => t.tokenType)))
                .filter(type => isAllowedTokenType(type))

            // For each token type, check if there are themed tokens before importing
            tokenTypes.forEach(type => {
                // Skip if exportOnlyThemedTokens is true and there are no themed tokens of this type
                if (exportConfiguration.exportOnlyThemedTokens && typeof theme !== 'string') {
                    const themedTokens = ThemeHelper.filterThemedTokens(
                        tokens.filter(t => t.tokenType === type),
                        theme as TokenTheme
                    )

                    // Skip this type if there are no themed tokens
                    if (themedTokens.length === 0) {
                        return
                    }
                }

                const fileName = getStyleFileName(type)
                content += `@import "./${themePath}/${fileName}";\n`
            })
        }
    })

    // Add disclaimer if enabled
    if (exportConfiguration.showGeneratedFileDisclaimer) {
        content = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, content)
    }

    // Create and return the output file
    return FileHelper.createTextFile({
        relativePath: exportConfiguration.baseIndexFilePath || "./",
        fileName: exportConfiguration.indexFileName || "index.css",
        content: content,
    })
}
