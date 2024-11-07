/**
 * Main configuration of the exporter - type interface. Default values for it can be set through `config.json` and users can override the behavior when creating the pipelines.
 */
export type ExporterConfiguration = {
  /** When enabled, empty style files will be generated. Otherwise empty are omitted */
  generateEmptyFiles: boolean
  /** When enabled, a single file will be generated for all tokens */
  generateSingleFile: boolean
  /** When enabled, themes will be inlined into the generated definition files under $themes key. Otherwise, themes will be generated as completely separate definitions, with themes applied */
  inlineThemes: boolean
  /** When enabled, theme values will be generated only for tokens that have overrides applied. Only changes output when `inlineThemes` is false. */
  themeOverridesOnly: boolean
  /** When enabled, JSONs will be prettified */
  prettifyJSON: boolean
  /** Max number of decimals in colors */
  colorPrecision: number
  /** Name of the base theme collection of tokens. In Supernova, every token has value. When themes are enabled (ie. dark mode), Supernova */
  baseThemeName: string
  /** All files will be written to this directory (relative to export root set by the exporter / pipeline configuration / VSCode extension) */
  baseStyleFilePath: string
  /** Index file will be written to this directory (relative to export root set by the exporter / pipeline configuration / VSCode extension) */
  baseIndexFilePath: string
}
