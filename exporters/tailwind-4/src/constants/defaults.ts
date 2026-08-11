import { TokenType } from "@supernovaio/sdk-exporters"

export const TAILWIND_TOKEN_PREFIXES: Record<TokenType, string> = {
  Color: "color",
  Typography: "text",
  Dimension: "spacing",
  Size: "spacing",
  Space: "spacing",
  Opacity: "opacity",
  FontSize: "text",
  LineHeight: "leading",
  LetterSpacing: "tracking",
  ParagraphSpacing: "paragraph",
  BorderWidth: "border",
  BorderRadius: "radius",
  Duration: "duration",
  ZIndex: "z",
  Shadow: "shadow",
  Border: "border",
  Gradient: "gradient",
  String: "string",
  ProductCopy: "product-copy",
  FontFamily: "font",
  FontWeight: "font-weight",
  TextCase: "text-case",
  TextDecoration: "text-decoration",
  Visibility: "visibility",
  Blur: "blur"
} 

/**
 * How the unit of a token value should be treated on export.
 *
 * - `rem`      convert an authored pixel value to rem
 * - `px`       emit the authored value untouched
 * - `unitless` strip the unit and emit the bare number
 */
export type UnitTreatment = "rem" | "px" | "unitless"

/**
 * Unit treatment resolved by token path, keyed by a path prefix.
 *
 * Dispatching on path rather than on token type is deliberate. Design systems
 * imported from Figma commonly type every scalar as a generic Dimension, which
 * makes `token.tokenType` useless as a signal: font sizes, radii, line heights
 * and even font weights all arrive as Dimension, so a type-based rule either
 * converts all of them or none of them. The path is where the semantics live.
 *
 * The longest matching prefix wins, so a specific path can override a broader
 * one. Anything that matches nothing falls back to `px`, which is the authored
 * value - no value is ever converted to rem and then converted back.
 *
 * Defaults, and why:
 * - spacing and font sizes are rem so they scale with the reader's browser font
 *   size rather than ignoring it
 * - radius stays px because rem-scaled corner radii look wrong at large text
 *   sizes. This departs from the Tailwind v4 defaults, and does so knowingly
 * - line height and letter spacing stay px because they were authored in px
 *   against specific text styles. Converting them needs a base font size that
 *   the token does not carry, so it would be a design change, not a unit fix
 * - font weight is unitless because a weight is a bare number. Figma stores it
 *   as a Dimension, which forces a unit onto it, and `600px` is meaningless
 */
export const DEFAULT_TOKEN_PATH_UNITS: Record<string, UnitTreatment> = {
  "reference/spacing": "rem",
  "reference/font-size": "rem",
  "reference/radius": "px",
  "reference/line-height": "px",
  "reference/letter-spacing": "px",
  "reference/paragraph-spacing": "px",
  "reference/font-weight": "unitless"
}

/**
 * Variable namespace overrides resolved by token path, keyed by a path prefix.
 *
 * Without an override the namespace comes from `TAILWIND_TOKEN_PREFIXES`, which
 * is keyed by token type - so a generic Dimension lands under `spacing` no matter
 * what it actually represents. A font weight at `reference/font-weight/600` would
 * otherwise be emitted as `--spacing-reference-font-weight-600`.
 *
 * A matched token is named `<override>-<token name>`, dropping the intermediate
 * path segments, so the example above becomes `--font-weight-600`. Tailwind v4's
 * own font weight keys are named rather than numeric (`--font-weight-semibold`),
 * so numeric weights are additive and overwrite none of them.
 *
 * Every reference scale is mapped, not just font weight. Without this the whole
 * design system collapses into the `spacing` namespace and Tailwind generates no
 * text, radius, leading or tracking utilities at all - the tokens would exist as
 * CSS variables but no utility class would reference them.
 */
export const DEFAULT_TOKEN_PATH_PREFIXES: Record<string, string> = {
  "reference/spacing": "spacing",
  "reference/font-size": "text",
  "reference/line-height": "leading",
  "reference/letter-spacing": "tracking",
  "reference/radius": "radius",
  "reference/font-weight": "font-weight"
}

/**
 * Typography sub-properties whose pixel values are converted to rem.
 *
 * Typography tokens are composites, so their sub-values have no path of their own
 * and are dispatched on type instead. Only the font size scales with the reader's
 * font size; line height and letter spacing keep the unit they were authored in,
 * matching the standalone tokens above.
 */
export const REM_TYPOGRAPHY_PROPERTY_TYPES: ReadonlySet<TokenType> = new Set([
  TokenType.fontSize
])

/**
 * List of token types that can be customized in Tailwind 4
 * These are the token types supported by Tailwind CSS configuration
 * 
 * Unsupported token types that will be filtered out:
 * - Dimension (use size or space instead)
 * - ParagraphSpacing (not directly supported by Tailwind)
 * - Gradient (not a core Tailwind property)
 * - String (not relevant for CSS variables)
 * - ProductCopy (not relevant for CSS variables)
 * - TextCase (use Tailwind text-case utilities instead)
 * - TextDecoration (use Tailwind text-decoration utilities instead)
 * - Visibility (use Tailwind visibility utilities instead)
 */
export const TAILWIND_ALLOWED_CUSTOMIZATION: TokenType[] = [
  TokenType.color,
  TokenType.space,
  TokenType.size,
  TokenType.fontSize,
  TokenType.lineHeight,
  TokenType.letterSpacing,
  TokenType.radius,
  TokenType.borderWidth,
  TokenType.fontFamily,
  TokenType.fontWeight,
  TokenType.shadow,
  TokenType.opacity,
  TokenType.duration,
  TokenType.zIndex,
  TokenType.blur,
  TokenType.typography,
  TokenType.border,
  TokenType.dimension
] 


export const DEFAULT_CONFIG_FILE_NAMES: Record<TokenType, string> = {
  Color: "tailwind.color.css",
  Typography: "tailwind.typography.css",
  Dimension: "tailwind.dimension.css",
  Size: "tailwind.size.css",
  Space: "tailwind.space.css",
  Opacity: "tailwind.opacity.css",
  FontSize: "tailwind.font-size.css",
  LineHeight: "tailwind.line-height.css",
  LetterSpacing: "tailwind.letter-spacing.css",
  ParagraphSpacing: "tailwind.paragraph-spacing.css",
  BorderWidth: "tailwind.border-width.css",
  BorderRadius: "tailwind.border-radius.css",
  Duration: "tailwind.duration.css",
  ZIndex: "tailwind.z-index.css",
  Shadow: "tailwind.shadow.css",
  Border: "tailwind.border.css",
  Gradient: "tailwind.gradient.css",
  String: "tailwind.string.css",
  ProductCopy: "tailwind.product-copy.css",
  FontFamily: "tailwind.font-family.css",
  FontWeight: "tailwind.font-weight.css",
  TextCase: "tailwind.text-case.css",
  TextDecoration: "tailwind.text-decoration.css",
  Visibility: "tailwind.visibility.css",
  Blur: "tailwind.blur.css"
}
