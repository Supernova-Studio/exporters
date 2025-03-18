import { FileHelper, NamingHelper, StringCase } from '@supernovaio/export-helpers'
import { OutputTextFile, Token, TokenGroup, TokenType } from '@supernovaio/sdk-exporters'
import { exportConfiguration } from '..'
import { convertedToken } from '../content/token'

export function styleOutputFile(type: TokenType, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): OutputTextFile | null {
  // Filter tokens by top level type
  const tokensOfType = tokens.filter((token) => token.tokenType === type)

  // Filter out files where there are no tokens, if enabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null
  }

  // Convert all tokens
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  const newLines = '\n'.repeat(exportConfiguration.newLines)
  let convertedTokens = tokensOfType.map((token) => convertedToken(token, mappedTokens, tokenGroups)).join(newLines)

  // Create file content
  const defaultClassName = `App${NamingHelper.codeSafeVariableName(type, StringCase.pascalCase)}s`
  const className = exportConfiguration.classNames[type] ?? defaultClassName
  const indentString = ' '.repeat(exportConfiguration.indent)
  const importStatement = "import 'package:flutter/material.dart';"
  let content = `${importStatement}\n\nclass ${className} {\n${convertedTokens}\n\n${indentString}${className}._();\n}`

  // Process content if key files enabled
  if (exportConfiguration.useKeysFile) {
    const defaultTypeName = NamingHelper.codeSafeVariableName(type, StringCase.pascalCase)
    const typeName = exportConfiguration.keyTypeNames[type] ?? defaultTypeName
    const importKeyStatement = `import '${exportConfiguration.baseKeysFilePathImport}/${exportConfiguration.keyFileNames[type]}';`
    const importStatements = `${importStatement}\n${importKeyStatement}`
    content = `${importStatements}\n\nclass ${className} {\n${indentString}static const Map<String, ${typeName}> data = {\n${convertedTokens}\n${indentString}};\n}`
  }

  // Add disclaimer to every file if enabled
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    content = `/* ${exportConfiguration.disclaimer} */\n${content}`
  }

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseStyleFilePath,
    fileName: exportConfiguration.styleFileNames[type],
    content: content
  })
}
