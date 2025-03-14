import { FileHelper, ThemeHelper, GeneralHelper } from "@supernovaio/export-utils"
import { OutputTextFile, Token, TokenGroup, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { convertedToken } from "../content/token"

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

    if (resetRules.length > 0) {
        cssVariables += `\n${indentString}/* Reset default values */\n${indentString}${resetRules.join(`\n${indentString}`)}\n`
    }

    tokensByType.forEach((tokensOfType, type) => {
        // Add section comment for token type
        cssVariables += `\n${indentString}/* ${type} */\n`
        
        // Convert tokens to CSS variable declarations
        cssVariables += tokensOfType
            .map((token) => convertedToken(token, mappedTokens, tokenGroups))
            .join("\n")
        
        cssVariables += "\n"
    })

    // Use @theme directive for Tailwind 4
    content += `@theme {\n${cssVariables}}`

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