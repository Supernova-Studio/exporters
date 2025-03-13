import { StringCase, ColorFormat } from "@supernovaio/export-utils"
import { TokenType } from "@supernovaio/sdk-exporters"

/**
 * Main configuration of the exporter - type interface. Default values for it can be set through `config.json` and users can override the behavior when creating the pipelines.
 */
export enum ThemeExportStyle {
    ApplyDirectly = "applyDirectly",
    SeparateFiles = "separateFiles",
    MergedTheme = "mergedTheme",
    NestedThemes = "nestedThemes"
}

export enum FileStructure {
    SeparateByType = "separateByType",
    SingleFile = "singleFile"
}

export enum TokenSortOrder {
    Default = "default",
    Alphabetical = "alphabetical"
}

export enum TokenNameStructure {
  PathAndName = "pathAndName",
  NameOnly = "nameOnly",
  CollectionPathAndName = "collectionPathAndName"
}

export type ExporterConfiguration = {
  /** When enabled, a disclaimer showing the fact that the file was generated automatically and should not be changed manually will appear in all style styles */
  showGeneratedFileDisclaimer: boolean
  /** When enabled, a disclaimer showing the fact that the file was generated automatically and should not be changed manually will appear in all style styles */
  disclaimer: string
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
  /** Number of spaces used for indentation in generated files */
  indent: number
  /** When set, will prefix each token name with this identifier */
  tokenPrefixes: Record<TokenType, string>
  /** Name of each file that will be generated. Tokens are grouped by type */
  styleFileNames: Record<TokenType, string>
  /** All files will be written to this directory (relative to export root) */
  baseStyleFilePath: string
  /** Controls how themes are exported in the generated files */
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
  /** Controls how tokens are sorted in the generated files */
  tokenSortOrder: TokenSortOrder
  /** Controls what parts are included in the token name */
  tokenNameStructure: TokenNameStructure
  /** When enabled, token names will be prefixed with their type */
  useTokenTypePrefixes: boolean
  /** Control how token styles are organized in files */
  fileStructure: FileStructure
}
