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

    // Start with Tailwind import
    let content = '@import "tailwindcss";\n\n'

    // Generate CSS variables grouped by token type
    let cssVariables = ''
    tokensByType.forEach((tokensOfType, type) => {
        // Add section comment for token type
        cssVariables += `\n  /* ${type} */\n`
        
        // Convert tokens to CSS variable declarations
        cssVariables += tokensOfType
            .map((token) => convertedToken(token, mappedTokens, tokenGroups))
            .join("\n")
        
        cssVariables += "\n"
    })

    // Determine the CSS selector based on whether this is a theme file
    const selector = themePath 
        ? exportConfiguration.themeSelector.replace('{theme}', themePath)
        : exportConfiguration.cssSelector

    // Add the CSS variables within the selector
    content += `${selector} {\n${cssVariables}}`

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
