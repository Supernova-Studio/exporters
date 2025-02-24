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
    collectionName?: string | null,
    globalPrefix?: string | null
  ): string {
    // Create array with all path segments and token name at the end
    let fragments: Array<string> = []

    // Add global prefix first if provided
    if (globalPrefix && globalPrefix.length > 0) {
      fragments.push(globalPrefix.trim())
    }

    // Add type-specific prefix if provided
    if (prefix && prefix.length > 0) {
      fragments.push(prefix)
    }

    // Add collection name if provided
    if (collectionName && collectionName.length > 0) {
      fragments.push(collectionName)
    }

    // Add parent path and name
    if (parent) {
      fragments.push(...parent.path)
      if (!parent.isRoot) {
        fragments.push(parent.name)
      }
    }

    // Add token name last
    fragments.push(token.name)

    return NamingHelper.codeSafeVariableName(fragments, format)
  }

  /**
   * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
   * if they contain spaces, case changes from one letter to another and so on.
   *
   * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
   */
  static codeSafeVariableName(fragments: Array<string> | string, format: StringCase): string {
    let sentence = typeof fragments === 'string' ? fragments : fragments.join(' ')

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