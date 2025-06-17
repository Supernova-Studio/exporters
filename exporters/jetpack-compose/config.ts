import { TokenType } from "@supernovaio/sdk-exporters"

/**
 * Main configuration of the exporter - type interface. Default values for it can be set through `config.json` and users can override the behavior when creating the pipelines.
 */
export enum FileStructure {
  SeparateByType = "separateByType",
  SingleFile = "singleFile"
}

export enum TokenNameStructure {
  PathAndName = "pathAndName",
  NameOnly = "nameOnly",
  CollectionPathAndName = "collectionPathAndName"
}

export type ExporterConfiguration = {
  /** Values will use references to other tokens (where applicable). */
  useReferences: boolean
  /** Theme files will only include tokens that have different values from the base value. */
  exportOnlyThemedTokens: boolean
  /** Base token values will be exported along with themes. */
  exportBaseValues: boolean
  /** Create a Kotlin object that references all token files. */
  generateIndexFile: boolean
  /** File name of the generated index object. */
  indexFileName: string
  /** Base package name used for all generated files. */
  packageNamePrefix: string
  /** Package name used for resource (R) imports; empty falls back to the package name prefix. */
  rPackageName: string
  /** Choose how generated token files are organized. */
  fileStructure: FileStructure
  /** Base name for the Kotlin file and object containing all tokens. */
  singleFileName: string
  /** Directory for files without applied themes, relative to the export root. */
  nonThemedFilePath: string
  /** Enable to override default file names for each token type. */
  customizeSeparatedByTypeFileNames: boolean
  /** Specify file name for each token type. */
  separatedByTypeFileNames: Record<TokenType, string>
  /** Create empty token files instead of skipping them. */
  generateEmptyFiles: boolean
  /** Prefix added to every generated property name. */
  globalNamePrefix: string
  /** Customize the prefixes for each design token type. */
  customizeTokenPrefixes: boolean
  /** Each token of a specific type is prefixed with the following identifier. */
  tokenPrefixes: Record<TokenType, string>
  /** Show the token description as a code comment for every exported token. */
  showDescriptions: boolean
  /** A message explaining that the file was automatically generated will appear in all token files. */
  showGeneratedFileDisclaimer: boolean
  /** A message explaining that the file was automatically generated will appear in all token files. */
  disclaimer: string
  /** Number of spaces used in generated Kotlin files. */
  indent: number
  /** Save generated variable names back to tokens as custom properties. */
  writeNameToProperty: boolean
  /** Name of the custom property where generated variable names will be saved. */
  propertyToWriteNameTo: string
}
