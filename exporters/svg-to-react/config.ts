import { AssetScale } from "@supernovaio/sdk-exporters"

/**
 * Main configuration of the exporter - type interface. Default values for it can be set through `config.json` and users can override the behavior when creating the pipelines.
 */
export type ExporterConfiguration = {
  /** Scale of the exported SVG. Allowed options are x1, x2, x3, x4. By default, assets are exported as x1, the original size */
  svgScale: AssetScale
  /** Optimize SVG using SVGO plugin. This will remove all unnecessary attributes from SVG, making it substantially smaller */
  optimize: boolean
  /** Include width and height attributes in the SVG */
  includeDimensions: boolean
  /** Include viewBox attribute in the SVG */
  includeViewBox: boolean
  /** Include aria-label for accessibility */
  includeDescription: boolean
  /** Mark SVG as decorative (aria-hidden="true") for accessibility */
  isDecorativeImage: boolean
  /** When enabled, definitions will be generated to be typecsript compatible, otherwise javascript definition is generated instead */
  typescript: boolean
  /** How components should be exported */
  exportStyle: "default" | "named" | "direct"
  /** Pattern for named or direct exports. Use {componentName} as placeholder */
  namedExportName: string
  /** Where to place {...props} in the SVG element */
  propsPosition: "start" | "end" | "none"
  /** Replace SVG attribute values. Common use: replace colors with CSS variables */
  replaceAttributeValues: Record<string, string>
  /** Add CSS classes to the SVG element for styling purposes */
  addClassesToSVGElement: boolean
  /** Space-separated CSS class names to add to the SVG element */
  svgClasses: string
  /** Format the generated React component code with Prettier */
  prettier: boolean
  /** Use single quotes instead of double quotes */
  singleQuote: boolean
  /** Add semicolons at the end of statements */
  semi: boolean
  /** Add trailing commas where valid */
  trailingComma: "none" | "es5" | "all"
  /** Maximum line length that Prettier will wrap on */
  printWidth: number
  /** Use tabs instead of spaces for indentation */
  tabs: boolean
  /** Number of spaces per indentation level (or tab size if using tabs) */
  prettierTabWidth: number
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
  /**
   * Ignored asset paths. By default, all icons will be exported, however, you can specify which paths should be excluded.
   * If you include partial path fragments, all paths matching will be ignored (such as `icons` will ignore all icons in `icons/` folder and its subfolders)
   * */
  ignoredAssetPaths: Array<string>
  /** Show auto-generation message in all style files */
  showGeneratedFileDisclaimer: boolean
  /** Custom message for auto-generated files */
  disclaimer: string
}
