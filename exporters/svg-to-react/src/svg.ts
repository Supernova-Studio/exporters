import { exportConfiguration } from "."
import { optimize } from "svgo"

export function optimizeSVG(svg: string): string {
  // Run SVGO to optimize the content of the SVG
  let optimizedSVG = exportConfiguration.optimize ? optimize(svg, exportConfiguration.svgoOptions).data : svg

  // If provided, replace all values in the SVG for the ones provided in the configuration. Useful to change hard-coded colors to stuff like "currentColor" and similar
  if (Object.keys(exportConfiguration.replaceValues).length > 0) {
    for (let [key, value] of Object.entries(exportConfiguration.replaceValues)) {
      optimizedSVG = optimizedSVG.replaceAll(key, value)
    }
  }

  return optimizedSVG
}
