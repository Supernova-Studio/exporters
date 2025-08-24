// Import the global exporter configuration
import { exportConfiguration } from "."
// Import our custom SVG to JSX conversion utility
import { simpleSvgToJsx } from "./simple-svg-to-jsx"
// Import SVGO for SVG optimization
import { optimize } from "svgo"
// Import template application utilities
import { applyCustomComponentTemplate } from "./templates"

/**
 * Generate Export Statement Based on Configuration
 * 
 * This function creates the appropriate export statement for a React component
 * based on the user's configured export style preference.
 * 
 * Export styles:
 * - "default": export default ComponentName (traditional default export)
 * - "named": export { ComponentName as ConfiguredName } (named export with optional renaming)
 * - "direct": export const ComponentName = ... (direct named export, no separate statement needed)
 * 
 * @param componentName - The name of the React component
 * @returns The export statement string, or empty string for direct exports
 */
function getExportStatement(componentName: string): string {
  switch (exportConfiguration.exportStyle) {
    case "named":
      // Allow users to customize the export name with {componentName} placeholder
      const namedExportName = exportConfiguration.namedExportName.replace('{componentName}', componentName)
      return `export { ${componentName} as ${namedExportName} }`
    case "direct":
      // Direct exports include the export keyword in the component declaration
      return ""
    case "default":
    default:
      return `export default ${componentName}`
  }
}

/**
 * Get the Final Export Name for Named/Direct Exports
 * 
 * When using named or direct export styles, this function resolves the final
 * component name by replacing the {componentName} placeholder in the user's
 * configured naming template.
 * 
 * @param componentName - The base component name
 * @returns The final export name with placeholders resolved
 */
function getNamedExportName(componentName: string): string {
  return exportConfiguration.namedExportName.replace('{componentName}', componentName)
}

/**
 * Apply Basic Code Formatting (Prettier Fallback)
 * 
 * This function provides basic code formatting when Prettier is not available
 * or fails to load. It focuses on making the SVG/JSX code more readable by:
 * - Breaking long SVG tags across multiple lines
 * - Adding proper indentation to nested elements
 * - Normalizing whitespace and line breaks
 * 
 * This is a simplified alternative to Prettier's more sophisticated formatting.
 * 
 * @param code - The code string to format
 * @param tabWidth - Number of spaces per indentation level
 * @param useTabs - Whether to use tabs instead of spaces for indentation
 * @returns Formatted code string
 */
function applyBasicFormatting(code: string, tabWidth: number, useTabs: boolean = false): string {
  const indent = useTabs ? '\t' : ' '.repeat(tabWidth)
  let formatted = code
  
  // Apply basic JSX/SVG formatting rules
  formatted = formatted
    // Format SVG opening tag and attributes
    .replace(/(<svg[^>]*?)(\s+[^>]*?>)/g, (match, openTag, rest) => {
      // If the tag is too long, break attributes to new lines for readability
      if (match.length > 80) {
        const attributes = rest.trim().slice(0, -1) // Remove the closing >
        const formattedAttrs = attributes
          .split(/\s+(?=\w+=")/g) // Split on attribute boundaries
          .map(attr => attr.trim())
          .filter(attr => attr.length > 0)
          .join(`\n${indent}${indent}`) // Double indent for attributes
        return `${openTag}\n${indent}${indent}${formattedAttrs}\n${indent}>`
      }
      return match
    })
    // Format nested SVG elements with proper indentation
    .replace(/(<path|<circle|<rect|<line|<polygon|<polyline|<ellipse|<g)([^>]*>)/g, (match, tag, rest) => {
      return `${indent}${tag}${rest}`
    })
    // Format closing tags with appropriate indentation
    .replace(/(<\/(?:g|svg)>)/g, (match) => {
      if (match === '</svg>') return match // Keep </svg> at root level
      return `${indent}${match}`
    })
    // Clean up excessive whitespace and normalize line breaks
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '>\n<')
  
  return formatted
}

/**
 * Convert SVG Markup to Complete React Component Code
 * 
 * This is the core transformation function that takes raw SVG markup and converts it
 * into a fully-formed React component with all user-configured customizations applied.
 * 
 * The conversion process includes:
 * 1. SVG optimization (optional, using SVGO)
 * 2. Converting SVG attributes to JSX format
 * 3. Applying user-defined attribute replacements
 * 4. Configuring dimensions and viewBox handling
 * 5. Adding accessibility attributes
 * 6. Applying CSS classes
 * 7. Adding prop spreading support
 * 8. Generating the complete React component structure
 * 9. Applying custom templates (if configured)
 * 10. Code formatting (Prettier or fallback)
 * 
 * @param svg - Raw SVG markup string from Supernova
 * @param componentName - The name for the React component
 * @returns Promise<string> - Complete React component source code
 */
export async function convertSvgToReactComponent(svg: string, componentName: string): Promise<string> {
  // STEP 1: Optimize SVG using SVGO if enabled
  // This reduces file size and cleans up unnecessary SVG elements/attributes
  let processedSvg = svg
  if (exportConfiguration.optimize) {
    const result = optimize(svg, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // Preserve viewBox as it's crucial for scalable icons
              removeViewBox: false,
            },
          },
        },
      ],
    })
    processedSvg = result.data
  }
  
  // STEP 2: Convert SVG attributes to JSX format
  // This handles the transformation from HTML-style attributes to React props
  let jsx = simpleSvgToJsx(processedSvg)
  
  // STEP 3: Apply user-defined attribute value replacements
  // Users can configure find/replace patterns for specific attribute values
  // Common use case: replacing hardcoded colors with CSS variables or props
  if (exportConfiguration.replaceAttributeValues) {
    Object.entries(exportConfiguration.replaceAttributeValues).forEach(([find, replace]) => {
      // Escape special regex characters in the find pattern for literal matching
      jsx = jsx.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace)
    })
  }
  
  // STEP 4: Handle dimensions based on user preference
  // Some users prefer responsive icons without fixed dimensions
  if (!exportConfiguration.includeDimensions) {
    jsx = jsx.replace(/\s(width|height)="[^"]*"/g, '')
  }
  
  // STEP 5: Handle viewBox based on user preference
  // ViewBox is crucial for scalability, but some users may want to remove it
  if (!exportConfiguration.includeViewBox) {
    jsx = jsx.replace(/\sviewBox="[^"]*"/g, '')
  }
  
  // STEP 6: Add accessibility attributes based on intended use
  if (exportConfiguration.isDecorativeImage) {
    // Mark as decorative to hide from screen readers
    jsx = jsx.replace(/<svg/, '<svg aria-hidden="true"')
  } else if (exportConfiguration.includeDescription) {
    // Add accessible label for semantic icons
    jsx = jsx.replace(/<svg/, `<svg aria-label="${componentName}"`)
  }
  
  // STEP 7: Add CSS classes to the SVG element if configured
  // This allows users to apply consistent styling across all generated icons
  if (exportConfiguration.addClassesToSVGElement && exportConfiguration.svgClasses.trim()) {
    const classNames = exportConfiguration.svgClasses.trim()
    jsx = jsx.replace(/<svg/, `<svg className="${classNames}"`)
  }
  
  // STEP 8: Add props spreading support for component flexibility
  // This allows parent components to pass through additional props (style, onClick, etc.)
  let jsxWithProps: string
  switch (exportConfiguration.propsPosition) {
    case "start":
      // Add props at the beginning of the SVG tag (higher precedence)
      // Example: <svg {...props} viewBox="0 0 24 24">
      jsxWithProps = jsx.replace(/<svg/, '<svg {...props} ')
      break
    case "end":
      // Add props at the end of the SVG tag (lower precedence, allows overrides)
      // Example: <svg viewBox="0 0 24 24" {...props}>
      jsxWithProps = jsx.replace(/<svg([^>]*)>/, '<svg$1 {...props}>')
      break
    case "none":
      // Don't add props support - static component
      jsxWithProps = jsx
      break
    default:
      // Default to end position for safer prop merging
      jsxWithProps = jsx.replace(/<svg([^>]*)>/, '<svg$1 {...props}>')
  }
  
  // STEP 9: Generate the complete React component structure
  // This creates the final component code with proper imports, function signature, and exports
  let componentCode: string
  const includeProps = exportConfiguration.propsPosition !== "none"
  const exportStatement = getExportStatement(componentName)
  
  // For direct exports, the component name in the declaration should match the export name
  const actualComponentName = exportConfiguration.exportStyle === "direct" 
    ? getNamedExportName(componentName) 
    : componentName
  
  // Generate component code based on user configuration matrix:
  // - TypeScript vs JavaScript
  // - With props vs without props
  // - Default export vs Named export vs Direct export
  
  if (exportConfiguration.typescript) {
    if (includeProps) {
      if (exportConfiguration.exportStyle === "direct") {
        // TypeScript + Props + Direct Export
        componentCode = `import * as React from "react"
import type { SVGProps } from "react"

export const ${actualComponentName} = (props: SVGProps<SVGSVGElement>) => (
  ${jsxWithProps}
)`
      } else {
        // TypeScript + Props + Default/Named Export
        componentCode = `import * as React from "react"
import type { SVGProps } from "react"

const ${actualComponentName} = (props: SVGProps<SVGSVGElement>) => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    } else {
      if (exportConfiguration.exportStyle === "direct") {
        // TypeScript + No Props + Direct Export
        componentCode = `import * as React from "react"

export const ${actualComponentName} = () => (
  ${jsxWithProps}
)`
      } else {
        // TypeScript + No Props + Default/Named Export
        componentCode = `import * as React from "react"

const ${actualComponentName} = () => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    }
  } else {
    // JavaScript variants (no TypeScript type annotations)
    if (includeProps) {
      if (exportConfiguration.exportStyle === "direct") {
        // JavaScript + Props + Direct Export
        componentCode = `import * as React from "react"

export const ${actualComponentName} = (props) => (
  ${jsxWithProps}
)`
      } else {
        // JavaScript + Props + Default/Named Export
        componentCode = `import * as React from "react"

const ${actualComponentName} = (props) => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    } else {
      if (exportConfiguration.exportStyle === "direct") {
        // JavaScript + No Props + Direct Export
        componentCode = `import * as React from "react"

export const ${actualComponentName} = () => (
  ${jsxWithProps}
)`
      } else {
        // JavaScript + No Props + Default/Named Export
        componentCode = `import * as React from "react"

const ${actualComponentName} = () => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    }
  }
  
  // STEP 10: Apply custom template transformation if configured
  // Advanced users can provide custom templates to override the default component structure
  let finalCode = applyCustomComponentTemplate(componentCode, componentName, jsxWithProps)
  
  // STEP 11: Apply code formatting for consistent, readable output
  if (exportConfiguration.prettier) {
    try {
      // Attempt to use Prettier for professional code formatting
      const prettier = require('prettier/standalone')
      const typescriptParser = require('prettier/plugins/typescript')
      const babelParser = require('prettier/plugins/babel')
      const estreePlugin = require('prettier/plugins/estree')
      
      const parser = exportConfiguration.typescript ? typescriptParser : babelParser
      
      finalCode = prettier.format(finalCode, {
        parser: exportConfiguration.typescript ? 'typescript' : 'babel',
        plugins: [estreePlugin, parser],
        tabWidth: exportConfiguration.prettierTabWidth,
        useTabs: exportConfiguration.tabs,
        singleQuote: exportConfiguration.singleQuote,
        semi: exportConfiguration.semi,
        trailingComma: exportConfiguration.trailingComma,
        printWidth: exportConfiguration.printWidth
      })
    } catch (error) {
      // Graceful degradation: use basic formatting if Prettier fails to load or parse
      finalCode = applyBasicFormatting(finalCode, exportConfiguration.prettierTabWidth, exportConfiguration.tabs)
    }
  }
  
  return finalCode
}

/**
 * Generate Index File Content for Component Re-exports
 * 
 * This function creates the content for a central index file that re-exports
 * all generated React components. The export style matches the configuration
 * used for individual components, ensuring consistency across the export.
 * 
 * The generated index enables clean imports:
 * - Default: import { IconName } from './components'
 * - Named: import { CustomIconName } from './components'  
 * - Direct: import { IconName } from './components' (all exports available)
 * 
 * @param filePaths - Array of component file information (path and name)
 * @returns String containing all export statements joined by newlines
 */
export function generateIndexFile(filePaths: Array<{ path: string; componentName: string }>): string {
  // Generate export statements for each component file
  const exportEntries = filePaths.map(({ path, componentName }) => {
    switch (exportConfiguration.exportStyle) {
      case "direct":
        // Re-export all named exports from the component file
        // This works because direct exports use: export const ComponentName = ...
        return `export * from './${path}/${componentName}'`
      case "named":
        // Re-export the specific named export, respecting any configured renaming
        const namedExportName = exportConfiguration.namedExportName.replace('{componentName}', componentName)
        return `export { ${namedExportName} } from './${path}/${componentName}'`
      case "default":
      default:
        // Re-export default exports as named exports for better tree-shaking
        return `export { default as ${componentName} } from './${path}/${componentName}'`
    }
  })
  return exportEntries.join('\n')
}
