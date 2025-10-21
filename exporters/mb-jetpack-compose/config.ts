export type ExporterConfiguration = {
  /** List of token collection names to export (e.g., primitive, semantic) */
  collectionNameFilters: string[]
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
  /** Collections that will be generated as @Immutable objects with concrete values */
  primitiveCollections: string[]
  /** Collections that will be generated as interface + themed implementations */
  semanticCollections: string[]
  /** Name of the interface file (without .kt extension) */
  interfaceFileName: string
  /** Name of the Kotlin interface */
  interfaceName: string
  /** Annotation to add to interface properties (e.g., @DesignPropertyV2) */
  interfacePropertyAnnotation: string
  /** Folder name where interface and themed implementations will be generated */
  themeFolderName: string
  /** Only include tokens that have different values in themes */
  exportOnlyThemedTokens: boolean
  /** Generate non-themed base files alongside themed implementations */
  exportBaseValues: boolean
}
