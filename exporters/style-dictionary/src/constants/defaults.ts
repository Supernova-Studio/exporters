import { TokenType } from "@supernovaio/sdk-exporters"

export const DEFAULT_STYLE_FILE_NAMES: Record<TokenType, string> = {
  Color: "color.json",
  Typography: "typography.json",
  Dimension: "dimension.json",
  Size: "size.json",
  Space: "space.json",
  Opacity: "opacity.json",
  FontSize: "font-size.json",
  LineHeight: "line-height.json",
  LetterSpacing: "letter-spacing.json",
  ParagraphSpacing: "paragraph-spacing.json",
  BorderWidth: "border-width.json",
  BorderRadius: "border-radius.json",
  Duration: "duration.json",
  ZIndex: "z-index.json",
  Shadow: "shadow.json",
  Border: "border.json",
  Gradient: "gradient.json",
  String: "string.json",
  ProductCopy: "product-copy.json",
  FontFamily: "font-family.json",
  FontWeight: "font-weight.json",
  TextCase: "text-case.json",
  TextDecoration: "text-decoration.json",
  Visibility: "visibility.json",
  Blur: "blur.json"
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