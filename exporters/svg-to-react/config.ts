import { AssetScale } from "@supernovaio/sdk-exporters"

/**
 * Main configuration of the exporter - type interface. Default values for it can be set through `config.json` and users can override the behavior when creating the pipelines.
 */
export type ExporterConfiguration = {
  /** Scale of the exported SVG. Allowed options are x1, x2, x3, x4. By default, assets are exported as x1, the original size */
  svgScale: AssetScale
  /** Optimize SVG using SVGO plugin. This will remove all unnecessary attributes from SVG, making it substantially smaller */
  optimize: boolean
  /** When provided, SVGO will be configured with these options. Check https://github.com/svg/svgo for all various options */
  svgoOptions: object
  /** When enabled, definitions will be generated to be typecsript compatible, otherwise javascript definition is generated instead */
  typescript: boolean
  /** When enabled, original SVGs will be preserved */
  keepOriginalSvgs: boolean
  /** Folder to write the original SVGs to. Ignored when original SVGs are not generated to the output */
  originalSvgFolder: string
  /** Folder to write the components to */
  componentFolder: string
  /** When enabled, component template will be used instead of the default ones */
  customComponentTemplate: boolean
  /** Template of the generated component */
  componentTemplate: string
  /** Generate index file */
  generateIndex: boolean
  /** When enabled, index template will be used instead of the default one */
  customIndexTemplate: boolean
  /** Template of the generated index file */
  indexTemplate: string
  /** When provided, each key will be replaced with provided value */
  replaceValues: Record<string, string>
  /**
   * Ignored asset paths. By default, all icons will be exported, however, you can specify which paths should be excluded.
   * If you include partial path fragments, all paths matching will be ignored (such as `icons` will ignore all icons in `icons/` folder and its subfolders)
   * */
  ignoredAssetPaths: Array<string>
}
