import { StringCase } from "@supernovaio/export-utils"

export type ExporterConfiguration = {
  /** When true, create the root Xcode catalog folder and its Contents.json */
  generateRootCatalog: boolean
  /** Root catalog path (e.g., "Colors.xcassets"). Can include "/" to create nested folders. */
  rootCatalogPath: string
  /** Case/style used to format folder (color set) names */
  folderNameStyle: StringCase
  /** Enable writing generated folder names back to tokens as custom property */
  writeNameToProperty: boolean
  /** Name of the custom property used for write-back */
  propertyToWriteNameTo: string
}
