import { Token, TokenGroup } from "@supernovaio/sdk-exporters"
import { StringCase } from "../enums/StringCase"
import { RepeatedWords } from "../enums/RepeatedWords"
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
  /**
   * Helper method to apply find/replace patterns to a string
   * @param text The text to apply replacements to
   * @param findReplace Record of find/replace patterns
   * @returns The text with all replacements applied
   */
  private static applyFindReplace(text: string, findReplace?: Record<string, string>): string {
    if (!findReplace) return text;
    
    // Sort find patterns by length (longest first) to handle overlapping patterns
    const sortedPatterns = Object.entries(findReplace)
      .sort(([a], [b]) => b.length - a.length)
    
    let result = text;
    
    for (const [find, replace] of sortedPatterns) {
      // Escape special regex characters to ensure they're treated as literal characters
      const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      
      // Create a regex pattern that matches the word in two ways:
      // 1. Using standard word boundaries (\b) - matches transitions between word/non-word chars
      // 2. Using lookahead/lookbehind to match at string boundaries or between spaces
      //    This handles cases where \b alone might not work correctly
      const pattern = new RegExp(
        // Part 1: Match with standard word boundaries
        `\\b${escapedFind}\\b|` + 
        // Part 2: Match at start of string or after space AND before end of string or space
        `(?<=^|\\s)${escapedFind}(?=\\s|$)`, 
        'gi' // g: global (match all occurrences), i: case-insensitive
      )
      
      // Replace all occurrences with the replacement string
      result = result.replace(pattern, replace)
    }
    
    return result;
  }

  /**
   * Builds a token's variable name from the prefix, its group path and its name. By default, a word repeated where two
   * of these parts meet is written once ("Neutral" + "Neutral 500" → neutral-500); a word repeated inside one part is kept.
   * Keep writes every word ("Neutral" + "Neutral 500" → neutral-neutral-500)
   */
  static codeSafeVariableNameForToken(
    token: Pick<Token, 'name'>,
    format: StringCase,
    parent: Pick<TokenGroup, 'path' | 'isRoot' | 'name'> | null,
    prefix: string | null,
    findReplace?: Record<string, string>,
    repeatedWords: RepeatedWords = RepeatedWords.RemoveWhereFragmentsMeet
  ): string {
    // Create array with all path segments and token name at the end
    let fragments: Array<string> = []

    // Add parent path and name
    if (parent) {
      fragments.push(...parent.path)
      if (!parent.isRoot) {
        fragments.push(parent.name)
      }
    }

    // Step 2: In the Remove modes, if the path ends with "Red" and token name is "Red 500",
    // only "500" is added to avoid "Red Red 500"
    const tokenNameParts = token.name.split(/[\s-_]+/)
    
    // This checks if the first word of token name matches the last fragment (case insensitive)
    // and if so, the Remove modes append the remaining parts of the token name to that fragment
    const startsWithGroupName = fragments.length > 0 && tokenNameParts.length > 1 &&
      tokenNameParts[0].toLowerCase() === fragments[fragments.length - 1].toLowerCase()
    let mergesIntoGroup: boolean
    switch (repeatedWords) {
      case RepeatedWords.Keep:
        mergesIntoGroup = false
        break
      case RepeatedWords.RemoveWhereFragmentsMeet:
      case RepeatedWords.RemoveAll:
        mergesIntoGroup = startsWithGroupName
        break
      default:
        repeatedWords satisfies never
        throw new Error(`Unknown repeated words mode: ${repeatedWords}`)
    }
    if (mergesIntoGroup) {
      fragments[fragments.length - 1] += ` ${tokenNameParts.slice(1).join(' ')}`
    } else {
      fragments.push(token.name)
    }

    // Step 3: Apply find/replace to each path and name fragment (not prefix), keeping the fragments apart
    fragments = fragments.map((fragment) => NamingHelper.applyFindReplace(fragment, findReplace))

    // Step 4: Add prefix after find/replace (prefix should not be affected by find/replace)
    // Each prefix word is its own fragment, so "color" + collection "Color tokens" still collapses to color-tokens
    if (prefix && prefix.length > 0) {
      fragments.unshift(...kebabCase(prefix).split('-'))
    }

    // Step 5: Apply case formatting to the final fragments
    return NamingHelper.codeSafeVariableName(fragments, format, undefined, repeatedWords)
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
    findReplace?: Record<string, string>,
    repeatedWords: RepeatedWords = RepeatedWords.Keep
  ): string {
    // Apply find/replace to each fragment, then only allow letters, digits, underscore and hyphen
    const cleanFragments = (typeof fragments === 'string' ? [fragments] : fragments).map((fragment) =>
      NamingHelper.applyFindReplace(fragment, findReplace).replaceAll(/[^a-zA-Z0-9_-]/g, '_')
    )
    // A word repeated where two fragments meet is written once
    const removeWhereFragmentsMeet = (fragmentsToJoin: Array<string>) =>
      fragmentsToJoin
        .reduce<Array<string>>((words, fragment) => {
          const fragmentWords = kebabCase(fragment).split('-').filter((word) => word.length > 0)
          return [...words, ...(fragmentWords[0] === words[words.length - 1] ? fragmentWords.slice(1) : fragmentWords)]
        }, [])
        .join(' ')
    let sentence: string
    switch (repeatedWords) {
      case RepeatedWords.Keep:
        sentence = cleanFragments.join('_')
        break
      case RepeatedWords.RemoveWhereFragmentsMeet:
        sentence = removeWhereFragmentsMeet(cleanFragments)
        break
      case RepeatedWords.RemoveAll:
        // Each word counts as a fragment
        sentence = removeWhereFragmentsMeet(cleanFragments.flatMap((fragment) => kebabCase(fragment).split('-')))
        break
      default:
        repeatedWords satisfies never
        throw new Error(`Unknown repeated words mode: ${repeatedWords}`)
    }

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