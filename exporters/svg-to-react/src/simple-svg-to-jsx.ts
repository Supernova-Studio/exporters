/**
 * Simple SVG to JSX Converter
 * 
 * This module provides a lightweight, dependency-free SVG to JSX conversion utility
 * that works reliably in sandboxed environments like Supernova's export runtime.
 * 
 * Key features:
 * - No external dependencies beyond basic JavaScript
 * - No async operations or timers (safe for sandboxed execution)
 * - Comprehensive SVG attribute mapping to React props
 * - Style attribute conversion from CSS strings to React objects
 * - Self-closing tag normalization
 * 
 * This is specifically designed for environments where full-featured libraries
 * like react-svg-parser or similar might not be available or reliable.
 */

/**
 * SVG Attribute to React Prop Mapping
 * 
 * This comprehensive mapping handles the conversion from SVG/HTML attributes
 * to their corresponding React prop names. React uses camelCase for props
 * where HTML/SVG uses kebab-case or other naming conventions.
 * 
 * Key conversions include:
 * - kebab-case to camelCase (e.g., 'stroke-width' → 'strokeWidth')
 * - Special React props (e.g., 'class' → 'className')
 * - SVG-specific attributes (e.g., 'viewBox', XML namespaces)
 * - Accessibility attributes (e.g., 'aria-*' attributes)
 */
const attributeMap: Record<string, string> = {
  'accent-height': 'accentHeight',
  'accumulate': 'accumulate',
  'additive': 'additive',
  'alignment-baseline': 'alignmentBaseline',
  'alphabetic': 'alphabetic',
  'amplitude': 'amplitude',
  'arabic-form': 'arabicForm',
  'ascent': 'ascent',
  'attributename': 'attributeName',
  'attributetype': 'attributeType',
  'azimuth': 'azimuth',
  'basefrequency': 'baseFrequency',
  'baseline-shift': 'baselineShift',
  'baseprofile': 'baseProfile',
  'bbox': 'bbox',
  'begin': 'begin',
  'bias': 'bias',
  'by': 'by',
  'calcmode': 'calcMode',
  'cap-height': 'capHeight',
  'class': 'className',
  'clip': 'clip',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'clippathunits': 'clipPathUnits',
  'color': 'color',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'color-rendering': 'colorRendering',
  'contentscripttype': 'contentScriptType',
  'contentstyletype': 'contentStyleType',
  'cursor': 'cursor',
  'cx': 'cx',
  'cy': 'cy',
  'd': 'd',
  'decelerate': 'decelerate',
  'descent': 'descent',
  'diffuseconstant': 'diffuseConstant',
  'direction': 'direction',
  'display': 'display',
  'divisor': 'divisor',
  'dominant-baseline': 'dominantBaseline',
  'dur': 'dur',
  'dx': 'dx',
  'dy': 'dy',
  'edgemode': 'edgeMode',
  'elevation': 'elevation',
  'enable-background': 'enableBackground',
  'end': 'end',
  'exponent': 'exponent',
  'externalresourcesrequired': 'externalResourcesRequired',
  'fill': 'fill',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'filter': 'filter',
  'filterres': 'filterRes',
  'filterunits': 'filterUnits',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'for': 'htmlFor',
  'from': 'from',
  'fx': 'fx',
  'fy': 'fy',
  'g1': 'g1',
  'g2': 'g2',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'glyphref': 'glyphRef',
  'gradienttransform': 'gradientTransform',
  'gradientunits': 'gradientUnits',
  'hanging': 'hanging',
  'height': 'height',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'ideographic': 'ideographic',
  'image-rendering': 'imageRendering',
  'in': 'in',
  'in2': 'in2',
  'intercept': 'intercept',
  'k': 'k',
  'k1': 'k1',
  'k2': 'k2',
  'k3': 'k3',
  'k4': 'k4',
  'kernelmatrix': 'kernelMatrix',
  'kernelunitlength': 'kernelUnitLength',
  'kerning': 'kerning',
  'keypoints': 'keyPoints',
  'keysplines': 'keySplines',
  'keytimes': 'keyTimes',
  'lengthadjust': 'lengthAdjust',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'limitingconeangle': 'limitingConeAngle',
  'local': 'local',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'markerheight': 'markerHeight',
  'markerunits': 'markerUnits',
  'markerwidth': 'markerWidth',
  'mask': 'mask',
  'maskcontentunits': 'maskContentUnits',
  'maskunits': 'maskUnits',
  'mathematical': 'mathematical',
  'mode': 'mode',
  'numoctaves': 'numOctaves',
  'offset': 'offset',
  'opacity': 'opacity',
  'operator': 'operator',
  'order': 'order',
  'orient': 'orient',
  'orientation': 'orientation',
  'origin': 'origin',
  'overflow': 'overflow',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'panose-1': 'panose1',
  'pathlength': 'pathLength',
  'patterncontentunits': 'patternContentUnits',
  'patterntransform': 'patternTransform',
  'patternunits': 'patternUnits',
  'pointer-events': 'pointerEvents',
  'points': 'points',
  'pointsatx': 'pointsAtX',
  'pointsaty': 'pointsAtY',
  'pointsatz': 'pointsAtZ',
  'preservealpha': 'preserveAlpha',
  'preserveaspectratio': 'preserveAspectRatio',
  'primitiveunits': 'primitiveUnits',
  'r': 'r',
  'radius': 'radius',
  'refx': 'refX',
  'refy': 'refY',
  'rendering-intent': 'renderingIntent',
  'repeatcount': 'repeatCount',
  'repeatdur': 'repeatDur',
  'requiredextensions': 'requiredExtensions',
  'requiredfeatures': 'requiredFeatures',
  'restart': 'restart',
  'result': 'result',
  'rotate': 'rotate',
  'rx': 'rx',
  'ry': 'ry',
  'scale': 'scale',
  'seed': 'seed',
  'shape-rendering': 'shapeRendering',
  'slope': 'slope',
  'spacing': 'spacing',
  'specularconstant': 'specularConstant',
  'specularexponent': 'specularExponent',
  'speed': 'speed',
  'spreadmethod': 'spreadMethod',
  'startoffset': 'startOffset',
  'stddeviation': 'stdDeviation',
  'stemh': 'stemh',
  'stemv': 'stemv',
  'stitchtiles': 'stitchTiles',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'string': 'string',
  'stroke': 'stroke',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'surfacescale': 'surfaceScale',
  'systemlanguage': 'systemLanguage',
  'tablevalues': 'tableValues',
  'targetx': 'targetX',
  'targety': 'targetY',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'textlength': 'textLength',
  'to': 'to',
  'transform': 'transform',
  'u1': 'u1',
  'u2': 'u2',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode': 'unicode',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'values': 'values',
  'vector-effect': 'vectorEffect',
  'version': 'version',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'viewbox': 'viewBox',
  'viewtarget': 'viewTarget',
  'visibility': 'visibility',
  'width': 'width',
  'widths': 'widths',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x': 'x',
  'x-height': 'xHeight',
  'x1': 'x1',
  'x2': 'x2',
  'xchannelselector': 'xChannelSelector',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
  'xmlns': 'xmlns',
  'xmlns:xlink': 'xmlnsXlink',
  'y': 'y',
  'y1': 'y1',
  'y2': 'y2',
  'ychannelselector': 'yChannelSelector',
  'z': 'z',
  'zoomandpan': 'zoomAndPan'
}

/**
 * Convert SVG Markup to JSX Format
 * 
 * This function performs the core transformation from SVG markup to JSX-compatible
 * markup that can be used in React components. It handles the key differences
 * between HTML/SVG and JSX syntax requirements.
 * 
 * Transformations performed:
 * 1. Attribute name conversion using the comprehensive mapping table
 * 2. Style attribute transformation from CSS string to React style object
 * 3. Self-closing tag formatting for JSX compliance
 * 
 * @param svg - Raw SVG markup string
 * @returns JSX-compatible markup string ready for use in React components
 * 
 * @example
 * Input:  '<svg class="icon" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
 * Output: '<svg className="icon" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>'
 */
export function simpleSvgToJsx(svg: string): string {
  let jsx = svg
  
  // STEP 1: Convert all SVG attributes to their React prop equivalents
  Object.entries(attributeMap).forEach(([svgAttr, jsxAttr]) => {
    // Use regex to match attributes in the context of SVG elements
    // This ensures we only replace actual attributes, not content that might contain similar text
    const regex = new RegExp(`(\\s)${svgAttr}(=)`, 'gi')
    jsx = jsx.replace(regex, `$1${jsxAttr}$2`)
  })
  
  // STEP 2: Convert style attribute from CSS string format to React style object
  // React requires style to be an object, not a string like in HTML/SVG
  jsx = jsx.replace(/style="([^"]*)"/g, (match, styles) => {
    const styleObj: Record<string, string> = {}
    
    // Parse CSS declarations and convert to camelCase object properties
    styles.split(';').forEach((style: string) => {
      const [key, value] = style.split(':').map((s: string) => s.trim())
      if (key && value) {
        // Convert CSS property names from kebab-case to camelCase
        // e.g., 'background-color' → 'backgroundColor'
        const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        styleObj[camelKey] = value
      }
    })
    
    // Return the style object in JSX format
    return `style={${JSON.stringify(styleObj)}}`
  })
  
  // STEP 3: Ensure all self-closing tags have proper JSX spacing
  // JSX requires a space before the closing /> for self-closing elements
  jsx = jsx.replace(/<([^>]+)\/>/g, '<$1 />')
  
  return jsx
}
