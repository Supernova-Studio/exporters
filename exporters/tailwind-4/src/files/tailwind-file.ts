import { FileHelper, ThemeHelper, GeneralHelper, FileNameHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType, TokenTheme, AnyTokenValue, AnyToken } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { FileStructure } from "../../config"
import { convertedToken, isAllowedTokenType, tokenVariableName } from "../content/token"
import { generateTypographyClass } from "../content/typography"
import { CSSHelper } from "@supernovaio/export-utils"
import { DEFAULT_CONFIG_FILE_NAMES } from "../constants/defaults"

/**
 * Processes tokens based on theme settings and filters
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
 * Generates reset rules for Tailwind configuration
 */
function generateResetRules(selector: string): string {
    if (!exportConfiguration.disableAllDefaults && selector !== '@theme') return ''

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
 * Generates CSS variables for tokens
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
 */
export function styleOutputFile(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): OutputTextFile | null {
    const processedTokens = processTokens(tokens, themePath, theme)
    if (processedTokens.length === 0) {
        return null
    }

    // Create a map of all tokens by ID for reference resolution
    const mappedTokens = new Map(tokens.map((token) => [token.id, token]))

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
    let cssVariables = generateResetRules(selector)
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
 */
export function generateStyleFiles(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): Array<OutputTextFile> {
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

    // Create a map of all tokens by ID for reference resolution
    const mappedTokens = new Map(tokens.map((token) => [token.id, token]))

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
        let cssVariables = type === tokensByType.keys().next().value 
            ? generateResetRules(selector) 
            : ''
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
            // For base files in separateByType mode, put them in a "base" folder
            relativePath = "./base/"
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
 * Generates an index file that imports all token style files and theme variations
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
                content += `@import "./base/${fileName}";\n`
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