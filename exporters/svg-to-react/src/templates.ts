import { exportConfiguration } from "."

export function applicableComponentTemplate(svg: string, name: string): string {
  if (exportConfiguration.customComponentTemplate) {
    return componentCustomTemplate(exportConfiguration.componentTemplate, svg, name)
  } else {
    return exportConfiguration.typescript ? componentTSTemplate(svg, name) : componentJSTemplate(svg, name)
  }
}

export function applicableIndexTemplate(path: string, name: string): string {
  if (exportConfiguration.customIndexTemplate) {
    return indexCustomTemplate(exportConfiguration.indexTemplate, path, name)
  } else {
    return indexTemplate(path, name)
  }
}

/** Component template used for generation when typescript is enabled */
export function componentTSTemplate(svg: string, name: string): string {
  return `
import * as React from "react"
import { SVGProps } from "react"

export const ${name} = (props: SVGProps<SVGSVGElement>) => (
  ${svg}
)
`
}

/** Component template used for generation when javascript is enabled */
export function componentJSTemplate(svg: string, name: string): string {
  return `
import * as React from "react"

export const ${name} = (props) => (
  ${svg}
)
`
}

/** Component template. Must contain {{svg}} and {{name}} tags */
export function componentCustomTemplate(template: string, svg: string, name: string): string {
  if (!template.includes("{{svg}}")) throw new Error("Template must contain {{svg}} tag")
  if (!template.includes("{{name}}")) throw new Error("Template must contain {{name}} tag")

  return template.replace("{{svg}}", svg).replace("{{name}}", name)
}

/** Index template used for generation when either typescript or javascript is enabled */
export function indexTemplate(path: string, name: string): string {
  return `export * from "./${path}/${name}"`
}

/** Index template. Must contain {{path}} and {{name}} tags */
export function indexCustomTemplate(template: string, path: string, name: string): string {
  if (!template.includes("{{path}}")) throw new Error("Template must contain {{path}} tag")
  if (!template.includes("{{name}}")) throw new Error("Template must contain {{name}} tag")

  return template.replace("{{path}}", path).replace("{{name}}", name)
}
