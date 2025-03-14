import { Token, TokenGroup } from "@supernovaio/sdk-exporters"
import { StringCase } from "../enums/StringCase"
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  trainCase,
  noCase,  
  kebabCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} from "change-case"

export class NamingHelper {
  static codeSafeVariableNameForToken(
    token: Pick<Token, 'name'>,
    format: StringCase,
    parent: Pick<TokenGroup, 'path' | 'isRoot' | 'name'> | null,
    prefix: string | null,
    findReplace?: Record<string, string>
  ): string {
    // Create array with all path segments and token name at the end
    let fragments: Array<string> = []
    if (parent) {
      fragments = [...parent.path]
      if (!parent.isRoot) {
        fragments.push(parent.name)
      }
    }

    // Split token name into words
    const tokenNameParts = token.name.split(/[\s-_]+/)
    
    // If the first word of token name matches the last fragment (case insensitive),
    // only add the remaining parts of the token name
    if (fragments.length > 0 && tokenNameParts.length > 1 && 
        tokenNameParts[0].toLowerCase() === fragments[fragments.length - 1].toLowerCase()) {
      fragments.push(tokenNameParts.slice(1).join(' '))
    } else {
      fragments.push(token.name)
    }
  
    if (prefix && prefix.length > 0) {
      fragments.unshift(prefix)
    }

    // Remove consecutive duplicates
    fragments = fragments.filter((fragment, index) => {
      // Keep if it's first element or different from previous
      return index === 0 || fragment.toLowerCase() !== fragments[index - 1].toLowerCase()
    })

    // Apply find/replace to each fragment if provided
    if (findReplace) {
      fragments = fragments.map(fragment => {
        let result = fragment
        for (const [find, replace] of Object.entries(findReplace)) {
          result = result.replace(new RegExp(find, 'g'), replace)
        }
        return result
      })
    }

    return NamingHelper.codeSafeVariableName(fragments, format)
  }

  /**
   * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
   * if they contain spaces, case changes from one letter to another and so on.
   *
   * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
   */
  static codeSafeVariableName(
    fragments: Array<string> | string,
    format: StringCase,
    findReplace?: Record<string, string>
  ): string {
    let sentence = typeof fragments === 'string' ? fragments : fragments.join(' ')

    // Apply find/replace if provided
    if (findReplace) {
      for (const [find, replace] of Object.entries(findReplace)) {
        sentence = sentence.replace(new RegExp(find, 'g'), replace)
      }
    }

    // Only allow letters, digits, underscore and hyphen
    sentence = sentence.replaceAll(/[^a-zA-Z0-9_-]/g, '_')

    switch (format) {
      case StringCase.camelCase:
        sentence = camelCase(sentence)
        break
      case StringCase.capitalCase:
        sentence = capitalCase(sentence)
        break
      case StringCase.constantCase:
        sentence = constantCase(sentence)
        break
      case StringCase.dotCase:
        sentence = dotCase(sentence)
        break
      case StringCase.trainCase:
        sentence = trainCase(sentence)
        break
      case StringCase.noCase:
        sentence = noCase(sentence)
        break
      case StringCase.kebabCase:
        sentence = kebabCase(sentence)
        break
      case StringCase.pascalCase:
        sentence = pascalCase(sentence)
        break
      case StringCase.pathCase:
        sentence = pathCase(sentence)
        break
      case StringCase.sentenceCase:
        sentence = sentenceCase(sentence)
        break
      case StringCase.snakeCase:
        sentence = snakeCase(sentence)
        break
      case StringCase.flatCase:
        sentence = camelCase(sentence).toLowerCase()
        break
      default:
        break
    }

    // Remove all underscores if format is not snake_case, since the library has unintended behavior with numberic values in this case
    if (format !== StringCase.snakeCase && format !== StringCase.constantCase) {
      sentence = sentence.replaceAll('_', '')
    }

    // If variable starts with anything but letter, add "_" in front of it
    if (sentence.match(/^[^a-zA-Z]/)) {
      sentence = '_' + sentence
    }

    return sentence
  }

  /** Convert any string to CSS variable reference */
  static nameAsCSSVarReference(name: string): string {
    return `var(--${name})`
  }

  /** Convert any string to CSS variable declaration */
  static nameAsCSSVarDeclaration(name: string): string {
    return `--${name}`
  }
} 