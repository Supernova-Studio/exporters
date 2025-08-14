import { exportConfiguration } from "."

export function applyCustomComponentTemplate(componentCode: string, componentName: string, jsx: string): string {
  if (!exportConfiguration.customComponentTemplate || !exportConfiguration.componentTemplate) {
    return componentCode
  }
  
  // Extract imports from the default component code
  const importMatch = componentCode.match(/(import[\s\S]*?)(?=\n\nconst|\n\nexport)/);
  const imports = importMatch ? importMatch[1].trim() : ''
  
  // Replace placeholders in custom template
  let customCode = exportConfiguration.componentTemplate
    .replace(/\$\{name\}/g, componentName)
    .replace(/\$\{svg\}/g, jsx)
    .replace(/\$\{imports\}/g, imports)
  
  return customCode
}

export function applyCustomIndexTemplate(indexContent: string, filePaths: Array<{ path: string; componentName: string }>): string {
  if (!exportConfiguration.customIndexTemplate || !exportConfiguration.indexTemplate) {
    return indexContent
  }
  
  // Replace placeholders in custom template
  let customIndex = exportConfiguration.indexTemplate
  
  // Replace {{exports}} with the export statements
  customIndex = customIndex.replace(/\{\{exports\}\}/g, indexContent)
  
  // Replace {{components}} with comma-separated component names
  const componentNames = filePaths.map(fp => fp.componentName).join(', ')
  customIndex = customIndex.replace(/\{\{components\}\}/g, componentNames)
  
  // Replace individual {{path}} and {{name}} if used in a loop context
  filePaths.forEach((fp, index) => {
    customIndex = customIndex.replace(new RegExp(`\{\{path\[${index}\]\}\}`, 'g'), fp.path)
    customIndex = customIndex.replace(new RegExp(`\{\{name\[${index}\]\}\}`, 'g'), fp.componentName)
  })
  
  return customIndex
}
