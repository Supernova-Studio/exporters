import { NamingHelper } from '@supernovaio/export-helpers'
import { Token, TokenGroup } from '@supernovaio/sdk-exporters'
import { exportConfiguration } from '..'
import { tokenToFlutterValue } from './flutter-token-helper'

export function convertedToken(token: Token, mappedTokens: Map<string, Token>, tokenGroups: Array<TokenGroup>): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups)

  // Then creating the value of the token, using another helper function
  const value = tokenToFlutterValue(token, mappedTokens, {
    decimals: exportConfiguration.colorPrecision
  })

  let indentString = ' '.repeat(exportConfiguration.indent)
  if (exportConfiguration.useKeysFile) indentString = indentString + indentString

  let prefix = '',
    suffix = ''
  // Generate token with comments
  if (exportConfiguration.showDescriptions && token.description) {
    prefix = `${indentString}/* ${token.description.trim()} */\n`
  }

  // Include separate file with keys
  if (exportConfiguration.useKeysFile) {
    suffix = `${indentString}${exportConfiguration.keyNames[token.tokenType]}.${name}: ${value},`
  } else {
    suffix = `${indentString}static const ${name} = ${value};`
  }

  return `${prefix}${suffix}`
}

export function convertedTokenKey(token: Token, tokenGroups: Array<TokenGroup>): string {
  const name = tokenVariableName(token, tokenGroups)

  let indentString = ' '.repeat(exportConfiguration.indent)
  if (exportConfiguration.useKeysFile) indentString = indentString + indentString

  return `${indentString}static const ${name} = "${name}";`
}

function tokenVariableName(token: Token, tokenGroups: Array<TokenGroup>): string {
  const prefix = exportConfiguration.tokenPrefixes[token.tokenType]
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!
  return NamingHelper.codeSafeVariableNameForToken(token, exportConfiguration.tokenNameStyle, parent, prefix)
}
