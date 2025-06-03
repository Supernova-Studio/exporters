import { StringCase, ColorFormat } from "@supernovaio/export-utils"
import { TokenType } from "@supernovaio/sdk-exporters"

/**
 * Main configuration of the exporter - type interface. Default values for it can be set through `config.json` and users can override the behavior when creating the pipelines.
 */
export enum ThemeExportStyle {
  ApplyDirectly = "applyDirectly",
  SeparateFiles = "separateFiles",
  MergedTheme = "mergedTheme",
}

export enum FileStructure {
  SeparateByType = "separateByType",
  SingleFile = "singleFile",
}

export enum TokenNameStructure {
  PathAndName = "pathAndName",
  NameOnly = "nameOnly",
  CollectionPathAndName = "collectionPathAndName",
}

export type ExporterConfiguration = {
  /** When enabled, a disclaimer showing the fact that the file was generated automatically and should not be changed manually will appear in all style styles */
  showGeneratedFileDisclaimer: boolean
  /** When enabled, a disclaimer showing the fact that the file was generated automatically and should not be changed manually will appear in all style styles */
  disclaimer: string
  /** When enabled, file with all css style files imported will be generated */
  generateIndexFile: boolean
  /** When enabled, empty style files will be generated. Otherwise empty are omitted */
  generateEmptyFiles: boolean
  /** When enabled, token description will be shown as code comments for every exported token */
  showDescriptions: boolean
  /** When enabled, values will use references to other tokens where applicable */
  useReferences: boolean
  /** Style of exported token names */
  tokenNameStyle: StringCase
  /** Number of spaces used to indent every css variables */
  indent: number
  /** When set, will prefix each token of a specific type with provided identifier. Put empty string if not necessary */
  tokenPrefixes: Record<TokenType, string>
  /** Name of each file that will be generated. Tokens are grouped by the type and will land in each of those files */
  styleFileNames: Record<TokenType, string>
  /** Name of the index file that will be generated */
  indexFileName: string
  /** Path to non-themed object files */
  nonThemedFilePath: string
  /** Index file will be written to this directory (relative to export root set by the exporter / pipeline configuration / VSCode extension) */
  baseIndexFilePath: string
  /** Name of the Kotlin object that contains all exported tokens */
  singleObjectName: string
  /** Theme suffix added to the Kotlin object name, {theme} will be replaced with the theme name */
  objectSuffixForThemes: string
  /** When enabled, themed files will only include tokens that have different values from the base theme */
  exportOnlyThemedTokens: boolean
  /** When enabled, base token values will be exported along with themes */
  exportBaseValues: boolean
  /** When enabled, allows customization of style file names */
  customizeStyleFileNames: boolean
  /** When enabled, allows customization of token prefixes */
  customizeTokenPrefixes: boolean
  /** Global prefix for all token names. When set, all tokens will be prefixed with this value */
  globalNamePrefix: string
  /** Controls how token styles are organized in files */
  fileStructure: FileStructure
  /** Controls what parts are included in the token name */
  tokenNameStructure: TokenNameStructure
  /** When enabled, generated variable names will be saved back to tokens as custom properties */
  writeNameToProperty: boolean
  /** Name of the custom property where generated variable names will be saved */
  propertyToWriteNameTo: string
  /** Name of the package where tokens are exported */
  packageName: string
}
