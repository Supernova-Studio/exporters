import { FileHelper, ThemeHelper, GeneralHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType, TokenTheme, AnyTokenValue, AnyToken } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { convertedToken, isAllowedTokenType } from "../content/token"
import { CSSHelper } from "@supernovaio/export-utils"

/**
 * Generates a single CSS output file containing all token styles in Tailwind format
 */
export function styleOutputFile(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, themePath: string = '', theme?: TokenTheme): OutputTextFile | null {


    // Skip if no tokens and empty files are disabled
    if (!exportConfiguration.generateEmptyFiles && tokens.length === 0) {
        return null
    }

    // For theme files: filter tokens to only include those that are themed
    let processedTokens = tokens
    if (themePath && theme && exportConfiguration.exportOnlyThemedTokens) {
        processedTokens = ThemeHelper.filterThemedTokens(tokens, theme)
        if (processedTokens.length === 0) {
            return null
        }
    }

    // Filter out tokens not allowed for Tailwind customization
    processedTokens = processedTokens.filter(token => isAllowedTokenType(token.tokenType))
    if (processedTokens.length === 0) {
        return null
    }

    // Group tokens by type for organized output
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

    // Start with Tailwind import with prefix if configured
    let content = exportConfiguration.globalPrefix 
        ? `@import "tailwindcss" prefix(${exportConfiguration.globalPrefix});\n\n`
        : '@import "tailwindcss";\n\n'

    // Add debug information at the top if enabled
    if (exportConfiguration.debug) {
        content += `/* Debug Information\n`
        content += ` * Exporter: Tailwind CSS by Supernova\n`
        content += ` * Theme: ${themePath || 'Base'}\n`
        content += ` * Token Count: ${processedTokens.length}\n`
        content += ` * Token Types: ${Array.from(tokensByType.keys()).join(', ')}\n`
        content += ` * Color Format: ${exportConfiguration.colorFormat}\n`
        content += ` * Prefix: ${exportConfiguration.globalPrefix || 'None'}\n`
        content += ` * Find/Replace Rules: ${JSON.stringify(exportConfiguration.findReplace)}\n`
        
        // Add detailed information about color utility prefixes
        if (exportConfiguration.useColorUtilityPrefixes) {
            content += ` * Color Utility Prefixes:\n`
            for (const [utilityName, patterns] of Object.entries(exportConfiguration.colorUtilityPrefixes)) {
                const patternArray = patterns.split(',').map(p => p.trim())
                content += `    - ${utilityName}: ${patternArray.join(', ')}\n`
            }
        } else {
            content += ` * Color Utility Prefixes: Disabled\n`
        }
        
        content += ` * Generated: ${new Date().toISOString()}\n`
        content += ` */\n\n`
    }

     // Use configured selector for base tokens or theme selector for themed tokens
     const selector = themePath && theme 
     ? exportConfiguration.themeSelector.replace('{theme}', themePath)
     : exportConfiguration.cssSelector


    // Generate CSS variables grouped by token type
    let cssVariables = ''

    // Add reset rules if any are enabled
    const indentString = GeneralHelper.indent(exportConfiguration.indent)
    const resetRules: string[] = []

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

    if (resetRules.length > 0 && selector === '@theme') {
        cssVariables += `\n${indentString}/* Reset default Tailwind configuration */\n${indentString}${resetRules.join(`\n${indentString}`)}\n`
    }

    tokensByType.forEach((tokensOfType, type) => {
        // Add section comment for token type
        cssVariables += `\n${indentString}/* ${type} */\n`
        
        // Add debug count information if debug is enabled
        if (exportConfiguration.debug) {
            cssVariables += `${indentString}/* ${tokensOfType.length} ${type} tokens */\n`
        }
        
        // Convert tokens to CSS variable declarations
        const cssDeclarations = tokensOfType
            .map((token) => convertedToken(token, mappedTokens, tokenGroups))
            .filter((declaration): declaration is string => declaration !== null) // Filter out null returns
            .join("\n")
        
        cssVariables += cssDeclarations + "\n"
    })

    // Check if any tokens use references and if references are enabled
    const hasReferences = exportConfiguration.useReferences && processedTokens.some(token => 
        // @ts-ignore
        token.value.referencedTokenId && token.value.referencedTokenId !== null && token.value.referencedTokenId !== undefined
    )

    // Add inline option for @theme if it's the base selector and there are references
    const themeDirective = selector === '@theme' && hasReferences ? '@theme inline' : selector
    content += `${themeDirective} {\n${cssVariables}}`

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