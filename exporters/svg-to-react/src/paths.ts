// Import utilities for consistent naming and string transformation
import { NamingHelper, StringCase } from "@supernovaio/export-utils"
// Import asset type definitions
import { RenderedAsset } from "@supernovaio/sdk-exporters"

/**
 * Generate Destination Path and Filename for Original SVG Assets
 * 
 * This function determines where original SVG files should be placed in the export
 * and what they should be named. It preserves the folder structure from the design
 * system while applying consistent naming conventions.
 * 
 * The function handles:
 * - Converting asset names to web-safe filenames (lowercase, hyphens instead of spaces)
 * - Preserving the design system's folder hierarchy
 * - Adding optional user-configured folder prefix
 * - Handling duplicate names with numeric suffixes
 * - Maintaining proper file extensions
 * 
 * @param asset - The rendered asset with metadata about name, path, and duplicates
 * @param folder - Optional folder prefix to prepend to the path
 * @returns Object containing the final filename and relative path
 * 
 * @example
 * Asset: { originalName: "Home Icon", group: { path: ["icons", "navigation"], name: "basic" } }
 * Result: { name: "home-icon.svg", path: "icons/navigation/basic" }
 */
export function exportAssetDestination(
  asset: RenderedAsset,
  folder: string | undefined
): {
  name: string
  path: string
} {
  // Get the file extension from the asset format (typically 'svg')
  const extension = asset.format.toString()
  
  // Handle duplicate names by appending a numeric suffix
  const duplicates = asset.previouslyDuplicatedNames > 0 ? "-" + asset.previouslyDuplicatedNames : ""
  
  // Convert the asset name to a web-safe filename format
  const name = asset.originalName.toLowerCase().replaceAll(" ", "-")

  // Build the complete folder path from the design system hierarchy
  let path = [...asset.group.path] // Copy the group path array
  path.push(asset.group.name)      // Add the immediate group name
  
  // Prepend user-configured folder if specified
  if (folder) {
    path = [folder, ...path]
  }
  
  // Create the final path string with consistent formatting
  const resultingPath = path.join("/").replaceAll(" ", "-").toLowerCase()

  // Return the complete destination information
  if (path.length > 0) {
    return {
      name: `${name}${duplicates}.${extension}`,
      path: resultingPath,
    }
  } else {
    // Fallback to root directory if no path is available
    return {
      name: `${name}${duplicates}.${extension}`,
      path: "./",
    }
  }
}

/**
 * Generate Destination Path and Filename for React Component Files
 * 
 * This function determines where React component files should be placed and what
 * they should be named. Unlike SVG assets, React components require names that
 * are valid JavaScript identifiers and follow React naming conventions.
 * 
 * The function handles:
 * - Converting asset names to valid React component names (PascalCase)
 * - Ensuring names are code-safe (no special characters, reserved words, etc.)
 * - Preserving the design system's folder hierarchy for organization
 * - Adding optional user-configured folder prefix
 * - Handling duplicate names with numeric suffixes
 * - Setting appropriate file extension (.tsx or .jsx based on configuration)
 * 
 * @param asset - The rendered asset with metadata about name, path, and duplicates
 * @param folder - Optional folder prefix to prepend to the path
 * @returns Object containing the component class name, filename, and relative path
 * 
 * @example
 * Asset: { originalName: "home icon", group: { path: ["icons"], name: "navigation" } }
 * Result: { className: "HomeIcon", name: "HomeIcon.tsx", path: "icons/navigation" }
 */
export function exportReactDefinitionDestination(
  asset: RenderedAsset,
  folder: string | undefined
): {
  className: string
  name: string
  path: string
} {
  // Handle duplicate names by appending a numeric suffix (no dash for component names)
  const duplicates = asset.previouslyDuplicatedNames > 0 ? asset.previouslyDuplicatedNames : ""
  
  // Convert the asset name to a valid React component name
  // This handles special characters, spaces, and ensures PascalCase formatting
  const name = NamingHelper.codeSafeVariableName(asset.originalName, StringCase.capitalCase).replaceAll(" ", "")
  
  // Use TypeScript extension by default (could be made configurable)
  const extension = "tsx"

  // Build the complete folder path from the design system hierarchy
  let path = [...asset.group.path] // Copy the group path array
  path.push(asset.group.name)      // Add the immediate group name
  
  // Prepend user-configured folder if specified
  if (folder) {
    path = [folder, ...path]
  }
  
  // Create the final path string with consistent formatting
  // Use lowercase and hyphens for folder paths (web-safe), but keep component names PascalCase
  const resultingPath = path.join("/").replaceAll(" ", "-").toLowerCase()

  // Return the complete destination information
  if (path.length > 0) {
    return {
      className: `${name}${duplicates}`,      // React component class name
      name: `${name}${duplicates}.${extension}`, // File name
      path: resultingPath,                    // Folder path
    }
  } else {
    // Fallback to root directory if no path is available
    return {
      className: `${name}${duplicates}`,
      name: `${name}${duplicates}.${extension}`,
      path: "./",
    }
  }
}

/**
 * Check if Asset Path Should Be Filtered Out (Excluded from Export)
 * 
 * This function implements a simple path filtering system that allows users to exclude
 * specific assets or entire folders from the export process. This is useful for:
 * - Excluding deprecated or outdated assets
 * - Filtering out platform-specific icons (e.g., only export web icons, not mobile)
 * - Removing work-in-progress or experimental assets
 * - Customizing exports for different environments or teams
 * 
 * The filtering logic uses substring matching - if any filter string is found
 * anywhere in the asset's path fragments, the asset is excluded.
 * 
 * @param filters - Array of filter strings to match against
 * @param pathFragments - Array of path components from the asset (e.g., ["icons", "navigation", "home"])
 * @returns true if the asset should be filtered out (excluded), false otherwise
 * 
 * @example
 * filters: ["deprecated", "mobile"]
 * pathFragments: ["icons", "deprecated", "home"] → returns true (filtered out)
 * pathFragments: ["icons", "web", "home"] → returns false (included)
 * 
 * @note Current implementation is O(n*m) where n=filters, m=pathFragments
 *       This is acceptable for typical use cases but could be optimized for very large filter lists
 */
export function isPathFilteredOut(filters: Array<string>, pathFragments: Array<string>): boolean {
  // Check each filter against each path fragment
  for (let filter of filters) {
    for (let pathFragment of pathFragments) {
      // Use substring matching - if the filter is found anywhere in the path fragment, exclude it
      if (filter.includes(pathFragment)) {
        return true
      }
    }
  }

  // If no filters matched, include the asset in the export
  return false
}
