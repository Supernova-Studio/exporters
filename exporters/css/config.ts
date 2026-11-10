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
  /** Format of the exported colors */
  colorFormat: ColorFormat
  /** Max number of decimals in colors */
  colorPrecision: number
  /** Number of spaces used to indent every css variables */
  indent: number
  /** When set, will prefix each token of a specific type with provided identifier. Put empty string if not necessary */
  tokenPrefixes: Record<TokenType, string>
  /** Name of each file that will be generated. Tokens are grouped by the type and will land in each of those files */
  styleFileNames: Record<TokenType, string>
  /** Name of the index file that will be generated */
  indexFileName: string
  /** All files will be written to this directory (relative to export root set by the exporter / pipeline configuration / VSCode extension) */
  baseStyleFilePath: string
  /** Index file will be written to this directory (relative to export root set by the exporter / pipeline configuration / VSCode extension) */
  baseIndexFilePath: string
  /** CSS selector where variables will be defined */
  cssSelector: string
  /** CSS selector pattern for themes, {theme} will be replaced with theme name */
  themeSelector: string
  /** Controls how themes are exported in the CSS files */
  exportThemesAs: ThemeExportStyle
  /** When enabled, themed files will only include tokens that have different values from the base theme */
  exportOnlyThemedTokens: boolean
  /** When enabled, base token values will be exported along with themes */
  exportBaseValues: boolean
  /** When enabled, converts pixel values to rem units */
  forceRemUnit: boolean
  /** Base pixel value for rem conversion (default: 16) */
  remBase: number
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
  /** If enabled, the resulting written properties will be encapsulated in var() syntax for easier copying */
  propertyToWriteNameToIncludesVar: boolean
  /** When enabled, references will include fallback values as raw token values to handle cases when referenced variables are not loaded */
  useFallbackValues: boolean
}
