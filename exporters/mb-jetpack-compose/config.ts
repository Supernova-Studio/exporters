export type ExporterConfiguration = {
  /** List of token collection names to export (e.g., primitive, semantic) */
  collectionNames: string[]
  /** Name of the folder where .kt files will be generated */
  outputFolderName: string
  /** Mapping of collection names to .kt file names (without extension) */
  fileNames: Record<string, string>
  /** Mapping of collection names to Kotlin object names */
  objectNames: Record<string, string>
  /** Enable writing generated property names back to tokens as custom property */
  writeNameToProperty: boolean
  /** Name of the custom property used for write-back */
  propertyToWriteNameTo: string
  
  // Theme Support
  /** Enable theme support - generate interface + themed implementations */
  enableThemeSupport: boolean
  /** Name of the interface file (without .kt extension) */
  interfaceFileName: string
  /** Name of the Kotlin interface */
  interfaceName: string
  /** Annotation to add to interface properties (e.g., @DesignPropertyV2) */
  interfacePropertyAnnotation: string
  
  // Theme Support - Interface scheme
  /** Collections to include in interface file */
  interfaceCollections: string[]
  
  // Theme Support - Theme tokens
  /** Collections to include in themed implementations */
  themeCollections: string[]
  /** Mapping of collection names to base file names for themed implementations */
  themeFileNames: Record<string, string>
  /** Mapping of collection names to Kotlin object names for themed implementations */
  themeObjectNames: Record<string, string>
  /** Name of the folder where themed implementation files will be generated */
  themeFolderName: string
  /** Name of the interface/class that theme objects extend (e.g., ColorScheme) */
  themeObjectExtends: string
}
