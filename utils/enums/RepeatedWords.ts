/** Which repeated words a name keeps when it is built from fragments, such as a prefix, a group path and a token name */
export enum RepeatedWords {
  /** "color", "color", "bg" → "color-color-bg" */
  Keep = "keep",
  /** A word repeated where two fragments meet is written once; a word repeated inside one fragment is kept */
  RemoveWhereFragmentsMeet = "removeWhereFragmentsMeet",
  /** Any word equal to the word before it is written once */
  RemoveAll = "removeAll",
}

/** Maps an exporter's "Remove repeated words" setting to the mode for token names */
export function repeatedWordsFromSetting(removeRepeatedWords: boolean): RepeatedWords {
  return removeRepeatedWords ? RepeatedWords.RemoveAll : RepeatedWords.RemoveWhereFragmentsMeet
}
