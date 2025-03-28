import { TokenType } from "@supernovaio/sdk-exporters"

export const DEFAULT_STYLE_FILE_NAMES: Record<TokenType, string> = {
  Color: "color.ts",
  Typography: "typography.ts",
  Dimension: "dimension.ts",
  Size: "size.ts",
  Space: "space.ts",
  Opacity: "opacity.ts",
  FontSize: "font-size.ts",
  LineHeight: "line-height.ts",
  LetterSpacing: "letter-spacing.ts",
  ParagraphSpacing: "paragraph-spacing.ts",
  BorderWidth: "border-width.ts",
  BorderRadius: "border-radius.ts",
  Duration: "duration.ts",
  ZIndex: "z-index.ts",
  Shadow: "shadow.ts",
  Border: "border.ts",
  Gradient: "gradient.ts",
  String: "string.ts",
  ProductCopy: "product-copy.ts",
  FontFamily: "font-family.ts",
  FontWeight: "font-weight.ts",
  TextCase: "text-case.ts",
  TextDecoration: "text-decoration.ts",
  Visibility: "visibility.ts",
  Blur: "blur.ts"
}

export const DEFAULT_TOKEN_PREFIXES: Record<TokenType, string> = {
  Color: "color",
  Typography: "typography",
  Dimension: "dimension",
  Size: "size",
  Space: "space",
  Opacity: "opacity",
  FontSize: "fontSize",
  LineHeight: "lineHeight",
  LetterSpacing: "letterSpacing",
  ParagraphSpacing: "paragraphSpacing",
  BorderWidth: "borderWidth",
  BorderRadius: "borderRadius",
  Duration: "duration",
  ZIndex: "zIndex",
  Shadow: "shadow",
  Border: "border",
  Gradient: "gradient",
  String: "string",
  ProductCopy: "productCopy",
  FontFamily: "fontFamily",
  FontWeight: "fontWeight",
  TextCase: "textCase",
  TextDecoration: "textDecoration",
  Visibility: "visibility",
  Blur: "blur"
} 