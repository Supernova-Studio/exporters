import { NamingHelper, StringCase } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType, TypographyTokenValue } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { runtimeVariableName, tokenVariableName, TYPOGRAPHY_VARIABLE_SUFFIXES, TypographyPart } from "./token"

/** The CSS property that a typography class sets from each part, in the order the class writes them */
const CLASS_PROPERTIES: Record<TypographyPart, string> = {
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  textDecoration: 'text-decoration',
  textCase: 'text-transform',
  paragraphIndent: 'text-indent',
  paragraphSpacing: 'margin-bottom'
}

/**
 * Generates a CSS class for a typography token
 * @param token - The typography token to generate a class for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @returns Formatted CSS class string or null if token is not a typography token
 */
export function generateTypographyClass(token: Token, tokenGroups: Array<TokenGroup>): string | null {
  // Skip if not a typography token
  if (token.tokenType !== TokenType.typography) {
    return null
  }

  const indentString = "  " // 2 spaces for layer content
  let output = ""

  // Add debug info if enabled
  if (exportConfiguration.debug) {
    const tokenPath = token.tokenPath || []
    const fullPath = [...tokenPath, token.name].join('/')
    output += `${indentString}/* Path: ${fullPath} */\n`
    output += `${indentString}/* Token: ${JSON.stringify({
      name: token.name,
      type: token.tokenType,
      path: token.tokenPath,
      value: (token as unknown as { value: TypographyTokenValue }).value
    })} */\n`
  }

  // Add description if enabled
  if (exportConfiguration.showDescriptions && token.description) {
    output += `${indentString}/* ${token.description.trim()} */\n`
  }

  // Generate class name from token path and name
  const className = NamingHelper.codeSafeVariableName(
    [...(token.tokenPath || []), token.name],
    StringCase.kebabCase,
    exportConfiguration.findReplace,
    true // Add removeDuplicateFragments parameter to prevent duplicated fragments
  )

  // Get the CSS variable name for reference
  const variableName = tokenVariableName(token, tokenGroups)

  // Every property reads the variable that the base file declares and theme files override
  output += `${indentString}.${className} {\n`
  Object.entries(CLASS_PROPERTIES).forEach(([part, cssProperty]) => {
    output += `${indentString}  ${cssProperty}: var(--${runtimeVariableName(`${variableName}${TYPOGRAPHY_VARIABLE_SUFFIXES[part as TypographyPart]}`)});\n`
  })
  
  output += `${indentString}}\n`

  return output
} 