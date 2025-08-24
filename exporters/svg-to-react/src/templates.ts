// Import the global exporter configuration for template settings
import { exportConfiguration } from "."

/**
 * Apply Custom Component Template Transformation
 * 
 * This function allows advanced users to completely override the default React component
 * structure by providing their own custom templates. This is useful for teams that need
 * specific patterns, additional imports, custom prop interfaces, or non-standard component structures.
 * 
 * The custom template system supports placeholder replacement:
 * - ${name}: The component name
 * - ${svg}: The processed JSX/SVG content
 * - ${imports}: Extracted import statements from the default component
 * 
 * If no custom template is configured, the function returns the original component code unchanged.
 * 
 * @param componentCode - The default generated component code
 * @param componentName - The name of the React component
 * @param jsx - The processed SVG content in JSX format
 * @returns Either the custom template with placeholders replaced, or the original code
 * 
 * @example
 * Custom template: "import React from 'react'\n\nconst ${name} = () => ${svg}\n\nexport default ${name}"
 * Result: A component with a different import style and export pattern
 */
export function applyCustomComponentTemplate(componentCode: string, componentName: string, jsx: string): string {
  // Check if custom templating is enabled and configured
  if (!exportConfiguration.customComponentTemplate || !exportConfiguration.componentTemplate) {
    return componentCode
  }
  
  // Extract import statements from the default component code to preserve them in custom templates
  // This regex looks for import statements at the beginning of the file
  const importMatch = componentCode.match(/(import[\s\S]*?)(?=\n\nconst|\n\nexport)/);
  const imports = importMatch ? importMatch[1].trim() : ''
  
  // Apply placeholder replacements in the custom template
  let customCode = exportConfiguration.componentTemplate
    .replace(/\$\{name\}/g, componentName)         // Component name
    .replace(/\$\{svg\}/g, jsx)                   // Processed SVG content
    .replace(/\$\{imports\}/g, imports)           // Default import statements
  
  return customCode
}

/**
 * Apply Custom Index Template Transformation
 * 
 * This function allows users to customize the structure and content of the generated
 * index file that re-exports all components. This is useful for teams that need:
 * - Custom headers or documentation
 * - Additional exports or type definitions
 * - Specific formatting or organization
 * - Integration with existing code patterns
 * 
 * The custom index template system supports multiple placeholder types:
 * - {{exports}}: The generated export statements for all components
 * - {{components}}: Comma-separated list of all component names
 * - {{path[0]}}, {{name[0]}}: Individual component paths and names (for advanced templating)
 * 
 * If no custom index template is configured, returns the original index content unchanged.
 * 
 * @param indexContent - The default generated index file content (export statements)
 * @param filePaths - Array of component file information for advanced templating
 * @returns Either the custom template with placeholders replaced, or the original content
 * 
 * @example
 * Custom template: "// Auto-generated icons\n{{exports}}\n\nexport const allIcons = [{{components}}]"
 * Result: Index file with header comment and additional array export
 */
export function applyCustomIndexTemplate(indexContent: string, filePaths: Array<{ path: string; componentName: string }>): string {
  // Check if custom index templating is enabled and configured
  if (!exportConfiguration.customIndexTemplate || !exportConfiguration.indexTemplate) {
    return indexContent
  }
  
  // Start with the user's custom template
  let customIndex = exportConfiguration.indexTemplate
  
  // Replace the main exports placeholder with the generated export statements
  customIndex = customIndex.replace(/\{\{exports\}\}/g, indexContent)
  
  // Replace component list placeholder with comma-separated component names
  // Useful for creating arrays or other aggregate structures
  const componentNames = filePaths.map(fp => fp.componentName).join(', ')
  customIndex = customIndex.replace(/\{\{components\}\}/g, componentNames)
  
  // Replace indexed placeholders for advanced templating scenarios
  // This allows templates to reference specific components by their position
  filePaths.forEach((fp, index) => {
    customIndex = customIndex.replace(new RegExp(`\{\{path\[${index}\]\}\}`, 'g'), fp.path)
    customIndex = customIndex.replace(new RegExp(`\{\{name\[${index}\]\}\}`, 'g'), fp.componentName)
  })
  
  return customIndex
}
