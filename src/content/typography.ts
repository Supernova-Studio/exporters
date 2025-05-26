import { NamingHelper, StringCase, CSSHelper } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType, TypographyTokenValue, FontFamilyTokenValue, TextDecorationTokenValue, TextCaseTokenValue, ParagraphSpacingTokenValue } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { tokenVariableName } from "./token"

/**
 * Generates a CSS class for a typography token
 * @param token - The typography token to generate a class for
 * @param tokenGroups - Array of token groups for determining token hierarchy
 * @returns Formatted CSS class string or null if token is not a typography token
 */
export function generateTypographyClass(token: Token, tokenGroups: Array<TokenGroup>, classPrefix = '.'): string | null {
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
    [...(token.tokenPath || []), token.name].join('-'),
    StringCase.kebabCase,
    exportConfiguration.findReplace,
    true // Add removeDuplicateFragments parameter to prevent duplicated fragments
  )

  // Get the CSS variable name for reference
  const variableName = tokenVariableName(token, tokenGroups)

  // Get the typography value
  const typographyValue = (token as unknown as { value: TypographyTokenValue }).value

  // Create empty token map since we're not using references here
  const emptyTokenMap = new Map<string, Token>()

  // Create CSS options
  const cssOptions = {
    allowReferences: false,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: () => "",
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase
  }

  // Generate the class with all typography properties
  output += `${indentString}${classPrefix}${className} {\n`

  // Font family
  if (typographyValue.fontFamily) {
    const fontFamilyValue = typographyValue.fontFamily as FontFamilyTokenValue
    output += `${indentString}  font-family: ${CSSHelper.stringTokenValueToCSS(fontFamilyValue, emptyTokenMap, cssOptions)};\n`
  }

  // Font size
  output += `${indentString}  font-size: var(--${variableName});\n`

  // Font weight
  output += `${indentString}  font-weight: var(--${variableName}--font-weight);\n`

  // Line height
  if (typographyValue.lineHeight) {
    output += `${indentString}  line-height: var(--${variableName}--line-height);\n`
  }

  // Letter spacing
  output += `${indentString}  letter-spacing: var(--${variableName}--letter-spacing);\n`

  // Text decoration
  if (typographyValue.textDecoration) {
    const textDecorationValue = typographyValue.textDecoration as TextDecorationTokenValue
    output += `${indentString}  text-decoration: ${CSSHelper.optionTokenValueToCSS(textDecorationValue, emptyTokenMap, cssOptions, TokenType.textDecoration)};\n`
  }

  // Text case
  if (typographyValue.textCase) {
    const textCaseValue = typographyValue.textCase as TextCaseTokenValue
    output += `${indentString}  text-transform: ${CSSHelper.optionTokenValueToCSS(textCaseValue, emptyTokenMap, cssOptions, TokenType.textCase)};\n`
  }

  // Paragraph indent
  if (typographyValue.paragraphIndent) {
    const paragraphIndentValue = typographyValue.paragraphIndent as ParagraphSpacingTokenValue
    output += `${indentString}  text-indent: ${CSSHelper.dimensionTokenValueToCSS(paragraphIndentValue, emptyTokenMap, cssOptions)};\n`
  }

  // Paragraph spacing
  if (typographyValue.paragraphSpacing) {
    const paragraphSpacingValue = typographyValue.paragraphSpacing as ParagraphSpacingTokenValue
    output += `${indentString}  margin-bottom: ${CSSHelper.dimensionTokenValueToCSS(paragraphSpacingValue, emptyTokenMap, cssOptions)};\n`
  }

  output += `${indentString}}\n`

  return output
}
