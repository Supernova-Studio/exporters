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
}
