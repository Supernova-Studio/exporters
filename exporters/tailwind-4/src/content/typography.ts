import { NamingHelper, StringCase } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType, TypographyTokenValue } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { runtimeVariableName, tokenVariableName } from "./token"

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

  // Get the typography value
  const typographyValue = (token as unknown as { value: TypographyTokenValue }).value

  // Every property reads the variable that the base file declares and theme files override
  const property = (cssProperty: string, suffix: string) =>
    `${indentString}  ${cssProperty}: var(--${runtimeVariableName(`${variableName}${suffix}`)});\n`

  // Generate the class with all typography properties
  output += `${indentString}.${className} {\n`
  if (typographyValue.fontFamily) output += property('font-family', '--font-family')
  output += property('font-size', '')
  output += property('font-weight', '--font-weight')
  if (typographyValue.lineHeight) output += property('line-height', '--line-height')
  output += property('letter-spacing', '--letter-spacing')
  if (typographyValue.textDecoration) output += property('text-decoration', '--text-decoration')
  if (typographyValue.textCase) output += property('text-transform', '--text-transform')
  if (typographyValue.paragraphIndent) output += property('text-indent', '--text-indent')
  if (typographyValue.paragraphSpacing) output += property('margin-bottom', '--paragraph-spacing')
  
  output += `${indentString}}\n`

  return output
} 