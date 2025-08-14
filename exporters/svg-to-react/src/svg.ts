import { exportConfiguration } from "."
import { simpleSvgToJsx } from "./simple-svg-to-jsx"
import { optimize } from "svgo"
import { applyCustomComponentTemplate } from "./templates"

function getExportStatement(componentName: string): string {
  switch (exportConfiguration.exportStyle) {
    case "named":
      const namedExportName = exportConfiguration.namedExportName.replace('{componentName}', componentName)
      return `export { ${componentName} as ${namedExportName} }`
    case "direct":
      // Direct exports don't need a separate export statement
      return ""
    case "default":
    default:
      return `export default ${componentName}`
  }
}

function getNamedExportName(componentName: string): string {
  return exportConfiguration.namedExportName.replace('{componentName}', componentName)
}

function applyBasicFormatting(code: string, tabWidth: number, useTabs: boolean = false): string {
  const indent = useTabs ? '\t' : ' '.repeat(tabWidth)
  let formatted = code
  
  // Basic JSX formatting
  formatted = formatted
    // Format SVG opening tag and attributes
    .replace(/(<svg[^>]*?)(\s+[^>]*?>)/g, (match, openTag, rest) => {
      // If the tag is too long, break attributes to new lines
      if (match.length > 80) {
        const attributes = rest.trim().slice(0, -1) // Remove the >
        const formattedAttrs = attributes
          .split(/\s+(?=\w+=")/g)
          .map(attr => attr.trim())
          .filter(attr => attr.length > 0)
          .join(`\n${indent}${indent}`)
        return `${openTag}\n${indent}${indent}${formattedAttrs}\n${indent}>`
      }
      return match
    })
    // Format nested SVG elements with proper indentation
    .replace(/(<path|<circle|<rect|<line|<polygon|<polyline|<ellipse|<g)([^>]*>)/g, (match, tag, rest) => {
      return `${indent}${tag}${rest}`
    })
    // Format closing tags
    .replace(/(<\/(?:g|svg)>)/g, (match) => {
      if (match === '</svg>') return match
      return `${indent}${match}`
    })
    // Clean up multiple spaces and normalize line breaks
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '>\n<')
  
  return formatted
}

export async function convertSvgToReactComponent(svg: string, componentName: string): Promise<string> {
  // Optimize SVG if enabled
  let processedSvg = svg
  if (exportConfiguration.optimize) {
    const result = optimize(svg, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
      ],
    })
    processedSvg = result.data
  }
  
  // Convert to JSX using our simple converter
  let jsx = simpleSvgToJsx(processedSvg)
  
  // Apply attribute replacements
  if (exportConfiguration.replaceAttributeValues) {
    Object.entries(exportConfiguration.replaceAttributeValues).forEach(([find, replace]) => {
      jsx = jsx.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace)
    })
  }
  
  // Remove dimensions if configured
  if (!exportConfiguration.includeDimensions) {
    jsx = jsx.replace(/\s(width|height)="[^"]*"/g, '')
  }
  
  // Remove viewBox if configured
  if (!exportConfiguration.includeViewBox) {
    jsx = jsx.replace(/\sviewBox="[^"]*"/g, '')
  }
  
  // Add accessibility attributes
  if (exportConfiguration.isDecorativeImage) {
    jsx = jsx.replace(/<svg/, '<svg aria-hidden="true"')
  } else if (exportConfiguration.includeDescription) {
    jsx = jsx.replace(/<svg/, `<svg aria-label="${componentName}"`)
  }
  
  // Add CSS classes to SVG element if configured
  if (exportConfiguration.addClassesToSVGElement && exportConfiguration.svgClasses.trim()) {
    const classNames = exportConfiguration.svgClasses.trim()
    jsx = jsx.replace(/<svg/, `<svg className="${classNames}"`)
  }
  
  // Add props spreading based on configuration
  let jsxWithProps: string
  switch (exportConfiguration.propsPosition) {
    case "start":
      // Add props at the beginning of the SVG tag
      jsxWithProps = jsx.replace(/<svg/, '<svg {...props} ')
      break
    case "end":
      // Add props at the end of the SVG tag (before the closing >)
      jsxWithProps = jsx.replace(/<svg([^>]*)>/, '<svg$1 {...props}>')
      break
    case "none":
      // Don't add props
      jsxWithProps = jsx
      break
    default:
      // Default to end
      jsxWithProps = jsx.replace(/<svg([^>]*)>/, '<svg$1 {...props}>')
  }
  
  // Generate React component
  let componentCode: string
  const includeProps = exportConfiguration.propsPosition !== "none"
  const exportStatement = getExportStatement(componentName)
  
  // For direct exports, use the named export name as the component name
  const actualComponentName = exportConfiguration.exportStyle === "direct" 
    ? getNamedExportName(componentName) 
    : componentName
  
  if (exportConfiguration.typescript) {
    if (includeProps) {
      if (exportConfiguration.exportStyle === "direct") {
        componentCode = `import * as React from "react"
import type { SVGProps } from "react"

export const ${actualComponentName} = (props: SVGProps<SVGSVGElement>) => (
  ${jsxWithProps}
)`
      } else {
        componentCode = `import * as React from "react"
import type { SVGProps } from "react"

const ${actualComponentName} = (props: SVGProps<SVGSVGElement>) => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    } else {
      if (exportConfiguration.exportStyle === "direct") {
        componentCode = `import * as React from "react"

export const ${actualComponentName} = () => (
  ${jsxWithProps}
)`
      } else {
        componentCode = `import * as React from "react"

const ${actualComponentName} = () => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    }
  } else {
    if (includeProps) {
      if (exportConfiguration.exportStyle === "direct") {
        componentCode = `import * as React from "react"

export const ${actualComponentName} = (props) => (
  ${jsxWithProps}
)`
      } else {
        componentCode = `import * as React from "react"

const ${actualComponentName} = (props) => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    } else {
      if (exportConfiguration.exportStyle === "direct") {
        componentCode = `import * as React from "react"

export const ${actualComponentName} = () => (
  ${jsxWithProps}
)`
      } else {
        componentCode = `import * as React from "react"

const ${actualComponentName} = () => (
  ${jsxWithProps}
)

${exportStatement}`
      }
    }
  }
  
  // Apply custom template if configured
  let finalCode = applyCustomComponentTemplate(componentCode, componentName, jsxWithProps)
  
  // Apply formatting if prettier is enabled
  if (exportConfiguration.prettier) {
    try {
      // Use Prettier with minimal bundle - include estree plugin
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
      // Fallback to basic formatting if Prettier fails
      finalCode = applyBasicFormatting(finalCode, exportConfiguration.prettierTabWidth, exportConfiguration.tabs)
    }
  }
  
  return finalCode
}

export function generateIndexFile(filePaths: Array<{ path: string; componentName: string }>): string {
  const exportEntries = filePaths.map(({ path, componentName }) => {
    switch (exportConfiguration.exportStyle) {
      case "direct":
        // For direct exports, use export * to re-export everything
        return `export * from './${path}/${componentName}'`
      case "named":
        const namedExportName = exportConfiguration.namedExportName.replace('{componentName}', componentName)
        return `export { ${namedExportName} } from './${path}/${componentName}'`
      case "default":
      default:
        return `export { default as ${componentName} } from './${path}/${componentName}'`
    }
  })
  return exportEntries.join('\n')
}
