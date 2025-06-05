"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KotlinHelper = exports.ImportCollector = exports.ImportFlag = void 0;
const sdk_exporters_1 = require("@supernovaio/sdk-exporters");
const ColorHelper_1 = require("./ColorHelper");
const TokenHelper_1 = require("./TokenHelper");
const GeneralHelper_1 = require("./GeneralHelper");
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports & flag enum
var ImportFlag;
(function (ImportFlag) {
    ImportFlag[ImportFlag["Color"] = 0] = "Color";
    ImportFlag[ImportFlag["Dp"] = 1] = "Dp";
    ImportFlag[ImportFlag["Sp"] = 2] = "Sp";
    ImportFlag[ImportFlag["Offset"] = 3] = "Offset";
    ImportFlag[ImportFlag["Brush"] = 4] = "Brush";
    ImportFlag[ImportFlag["TileMode"] = 5] = "TileMode";
    ImportFlag[ImportFlag["Shadow"] = 6] = "Shadow";
    ImportFlag[ImportFlag["BorderStroke"] = 7] = "BorderStroke";
    ImportFlag[ImportFlag["Modifier"] = 8] = "Modifier";
    ImportFlag[ImportFlag["Blur"] = 9] = "Blur";
    ImportFlag[ImportFlag["FontWeight"] = 10] = "FontWeight";
    ImportFlag[ImportFlag["TextDecoration"] = 11] = "TextDecoration";
    ImportFlag[ImportFlag["TextStyle"] = 12] = "TextStyle";
})(ImportFlag || (exports.ImportFlag = ImportFlag = {}));
/** Collect flags while generating literals, turn into imports at the end */
class ImportCollector {
    constructor() {
        this.flags = new Set();
    }
    /**
     * Marks a specific import to be used in a token
     * @param flags
     */
    use(...flags) {
        flags.forEach((x) => this.flags.add(x));
    }
    /**
     * Output a list of all sorted import literals needed for the specified tokens.
     */
    allImports() {
        const importList = [];
        if (this.flags.has(ImportFlag.Color))
            importList.push("import androidx.compose.ui.graphics.Color");
        if (this.flags.has(ImportFlag.Dp))
            importList.push("import androidx.compose.ui.unit.dp");
        if (this.flags.has(ImportFlag.Sp))
            importList.push("import androidx.compose.ui.unit.sp");
        if (this.flags.has(ImportFlag.Offset))
            importList.push("import androidx.compose.ui.geometry.Offset");
        if (this.flags.has(ImportFlag.Brush))
            importList.push("import androidx.compose.ui.graphics.Brush");
        if (this.flags.has(ImportFlag.TileMode))
            importList.push("import androidx.compose.ui.graphics.TileMode");
        if (this.flags.has(ImportFlag.Shadow))
            importList.push("import androidx.compose.ui.graphics.Shadow");
        if (this.flags.has(ImportFlag.BorderStroke))
            importList.push("import androidx.compose.foundation.BorderStroke");
        if (this.flags.has(ImportFlag.Modifier)) {
            importList.push("import androidx.compose.ui.Modifier");
            if (this.flags.has(ImportFlag.Blur))
                importList.push("import androidx.compose.ui.draw.blur");
        }
        if (this.flags.has(ImportFlag.FontWeight))
            importList.push("import androidx.compose.ui.text.font.FontWeight");
        if (this.flags.has(ImportFlag.TextDecoration))
            importList.push("import androidx.compose.ui.text.TextDecoration");
        if (this.flags.has(ImportFlag.TextStyle))
            importList.push("import androidx.compose.ui.text.TextStyle");
        return importList.sort();
    }
}
exports.ImportCollector = ImportCollector;
class KotlinHelper {
    static tokenValue(token, allTokens, options, importCollector) {
        const actualOptions = {
            rawColorTokenFormatter: (rawValue) => {
                return `Color(0x${rawValue})`;
            },
            ...options
        };
        /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
        let value;
        switch (token.tokenType) {
            case sdk_exporters_1.TokenType.color:
                value = this.colorTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.border:
                value = this.borderTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.gradient:
                value = this.gradientTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.dimension:
            case sdk_exporters_1.TokenType.size:
            case sdk_exporters_1.TokenType.space:
            case sdk_exporters_1.TokenType.opacity:
            case sdk_exporters_1.TokenType.fontSize:
            case sdk_exporters_1.TokenType.lineHeight:
            case sdk_exporters_1.TokenType.letterSpacing:
            case sdk_exporters_1.TokenType.paragraphSpacing:
            case sdk_exporters_1.TokenType.borderWidth:
            case sdk_exporters_1.TokenType.radius:
            case sdk_exporters_1.TokenType.duration:
            case sdk_exporters_1.TokenType.zIndex:
                value = this.dimensionTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.shadow:
                value = this.shadowTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.fontWeight:
                value = this.fontWeightTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.fontFamily:
            case sdk_exporters_1.TokenType.productCopy:
            case sdk_exporters_1.TokenType.string:
                value = this.stringTokenValueToKotlin(token.value, allTokens, actualOptions);
                break;
            case sdk_exporters_1.TokenType.textCase:
            case sdk_exporters_1.TokenType.textDecoration:
            case sdk_exporters_1.TokenType.visibility:
                value = this.optionTokenValueToKotlin(token.value, allTokens, actualOptions, token.tokenType, importCollector);
                break;
            case sdk_exporters_1.TokenType.blur:
                value = this.blurTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            case sdk_exporters_1.TokenType.typography:
                value = this.typographyTokenValueToKotlin(token.value, allTokens, actualOptions, importCollector);
                break;
            default:
                throw new sdk_exporters_1.UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:");
        }
        return value;
    }
    static colorTokenValueToKotlin(color, allTokens, options, importCollector) {
        importCollector.use(ImportFlag.Color);
        return ColorHelper_1.ColorHelper.formattedColorOrVariableName(color, allTokens, options);
    }
    static borderTokenValueToKotlin(border, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(border.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        importCollector.use(ImportFlag.BorderStroke);
        const widthLit = this.dimensionTokenValueToKotlin(border.width, allTokens, options, importCollector);
        const colorLit = this.colorTokenValueToKotlin(border.color, allTokens, options, importCollector);
        return `BorderStroke(${widthLit}, ${colorLit})`;
    }
    static gradientTokenValueToKotlin(gradients, allTokens, options, importCollector) {
        // Compose can draw only one Brush per shape; export all layers anyway,
        // so callers may overlay them manually
        const layers = gradients.map((g) => this.gradientLayerToKotlin(g, allTokens, options, importCollector));
        return layers.length === 1 ? layers[0] : `listOf(${layers.join(", ")})`;
    }
    /** Converts one gradient layer to a Brush literal */
    static gradientLayerToKotlin(value, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        importCollector.use(ImportFlag.Brush, ImportFlag.Offset);
        // Convert color stops
        const colorsLit = value.stops
            .map((stop) => this.colorTokenValueToKotlin(stop.color, allTokens, options, importCollector))
            .join(", ");
        const stopsLit = value.stops
            .map((stop) => ColorHelper_1.ColorHelper.roundToDecimals(stop.position, options.decimals) + "f")
            .join(", ");
        const indentString = GeneralHelper_1.GeneralHelper.indent(options.indent);
        // Choose Brush builder
        switch (value.type) {
            case sdk_exporters_1.GradientType.radial:
                importCollector.use(ImportFlag.TileMode);
                // center = midpoint of from/to, radius = distance between them (rough)
                const centerX = ((value.from.x + value.to.x) / 2).toFixed(2);
                const centerY = ((value.from.y + value.to.y) / 2).toFixed(2);
                return (`Brush.radialGradient(\n` +
                    `${indentString}${indentString}colors = listOf(${colorsLit}),\n` +
                    `${indentString}${indentString}center = Offset(${centerX}f, ${centerY}f),\n` +
                    `${indentString}${indentString}radius = 0.5f,\n` +
                    `${indentString}${indentString}tileMode = TileMode.Clamp,\n` +
                    `${indentString}${indentString}stops = floatArrayOf(${stopsLit})\n` +
                    `${indentString})`);
            case sdk_exporters_1.GradientType.angular:
                // sweep in Compose
                return (`Brush.sweepGradient(\n` +
                    `${indentString}${indentString}colors = listOf(${colorsLit}),\n` +
                    `${indentString}${indentString}center = Offset(0.5f, 0.5f),\n` +
                    `${indentString}${indentString}stops = floatArrayOf(${stopsLit})\n` +
                    `${indentString})`);
            case sdk_exporters_1.GradientType.linear:
            default:
                return (`Brush.linearGradient(\n` +
                    `${indentString}${indentString}colors = listOf(${colorsLit}),\n` +
                    `${indentString}${indentString}stops = floatArrayOf(${stopsLit}),\n` +
                    `${indentString}${indentString}start = Offset(${value.from.x}f, ${value.from.y}f),\n` +
                    `${indentString}${indentString}end = Offset(${value.to.x}f, ${value.to.y}f)\n` +
                    `${indentString})`);
        }
    }
    static shadowTokenValueToKotlin(shadows, allTokens, options, importCollector) {
        const layers = shadows.map((s) => this.shadowLayerToKotlin(s, allTokens, options, importCollector));
        const indentString = GeneralHelper_1.GeneralHelper.indent(options.indent);
        // Compose can draw only one shadow per shape; export all layers anyway,
        // so callers may overlay them manually
        return layers.length === 1
            ? layers[0]
            : `listOf(\n` + `${layers.map((l) => `${indentString}${indentString}${l}`).join(",\n")}` + `\n${indentString})`;
    }
    static shadowLayerToKotlin(value, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        importCollector.use(ImportFlag.Shadow, ImportFlag.Offset);
        const colorLit = this.colorTokenValueToKotlin({ ...value.color, ...(value.opacity && { opacity: value.opacity }) }, allTokens, options, importCollector);
        // Unsupported in Compose and therefore ignored: spread, inner-shadow
        const offsetX = ColorHelper_1.ColorHelper.roundToDecimals(value.x, options.decimals);
        const offsetY = ColorHelper_1.ColorHelper.roundToDecimals(value.y, options.decimals);
        const blur = ColorHelper_1.ColorHelper.roundToDecimals(value.radius, options.decimals);
        return `Shadow(color = ${colorLit}, offset = Offset(${offsetX}f, ${offsetY}f), blurRadius = ${blur}f)`;
    }
    static dimensionTokenValueToKotlin(dimension, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(dimension.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        const rounded = ColorHelper_1.ColorHelper.roundToDecimals(dimension.measure, options.decimals);
        // Percent requires scaling to 0-1 for Kotlin float
        if (dimension.unit === sdk_exporters_1.Unit.percent) {
            const fraction = +rounded / 100;
            return `${fraction}f`;
        }
        return `${rounded}${this.unitToKotlin(dimension.unit, importCollector)}`;
    }
    /** Maps Supernova units to Kotlin / Compose extension suffixes */
    static unitToKotlin(unit, importCollector) {
        switch (unit) {
            case sdk_exporters_1.Unit.percent:
                // Float literal (0.5f)
                return "f";
            case sdk_exporters_1.Unit.pixels:
                // density‑independent pixels
                importCollector.use(ImportFlag.Dp);
                return ".dp";
            case sdk_exporters_1.Unit.rem:
                // scale‑independent pixels for typography
                importCollector.use(ImportFlag.Sp);
                return ".sp";
            case sdk_exporters_1.Unit.ms:
            case sdk_exporters_1.Unit.raw:
                // plain number
                return "";
            default:
                importCollector.use(ImportFlag.Dp);
                return ".dp";
        }
    }
    static stringTokenValueToKotlin(value, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        return `"${value.text}"`;
    }
    static optionTokenValueToKotlin(option, allTokens, options, tokenType, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(option.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        if (tokenType === sdk_exporters_1.TokenType.textCase) {
            return this.textCaseToKotlin(option.value);
        }
        if (tokenType === sdk_exporters_1.TokenType.textDecoration) {
            return this.textDecorationToKotlin(option.value, importCollector);
        }
        return this.visibilityToKotlin(option.value);
    }
    static textCaseToKotlin(textCase) {
        // Compose has no built-in enum yet, so export as a string constant
        switch (textCase) {
            case sdk_exporters_1.TextCase.original:
                return `"none"`;
            case sdk_exporters_1.TextCase.upper:
                return `"uppercase"`;
            case sdk_exporters_1.TextCase.lower:
                return `"lowercase"`;
            case sdk_exporters_1.TextCase.camel:
                return `"capitalize"`;
            case sdk_exporters_1.TextCase.smallCaps:
                return `"smallCaps"`;
        }
    }
    static textDecorationToKotlin(textDecoration, importCollector) {
        importCollector.use(ImportFlag.TextDecoration);
        // Map directly onto androidx.compose.ui.text.TextDecoration
        switch (textDecoration) {
            case sdk_exporters_1.TextDecoration.original:
                return "TextDecoration.None";
            case sdk_exporters_1.TextDecoration.underline:
                return "TextDecoration.Underline";
            case sdk_exporters_1.TextDecoration.strikethrough:
                return "TextDecoration.LineThrough";
        }
    }
    static visibilityToKotlin(visibility) {
        return visibility === sdk_exporters_1.VisibilityType.visible ? "true" : "false";
    }
    static blurTokenValueToKotlin(blur, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(blur.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        importCollector.use(ImportFlag.Modifier, ImportFlag.Blur);
        return `Modifier.blur(${this.dimensionTokenValueToKotlin(blur.radius, allTokens, options, importCollector)})`;
    }
    static fontWeightTokenValueToKotlin(value, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Convert text weights to numerical values
        const normalizedWeight = (0, TokenHelper_1.normalizeTextWeight)(value.text);
        return this.fontWeightIntToKotlin(normalizedWeight, importCollector);
    }
    static fontWeightIntToKotlin(weight, importCollector) {
        importCollector.use(ImportFlag.FontWeight);
        switch (weight) {
            case 100:
                return "FontWeight.Thin";
            case 200:
                return "FontWeight.ExtraLight";
            case 300:
                return "FontWeight.Light";
            case 400:
                return "FontWeight.Normal";
            case 500:
                return "FontWeight.Medium";
            case 600:
                return "FontWeight.SemiBold";
            case 700:
                return "FontWeight.Bold";
            case 800:
                return "FontWeight.ExtraBold";
            case 900:
                return "FontWeight.Black";
            default:
                // Uncommon custom weight
                return `FontWeight(${weight})`;
        }
    }
    static typographyTokenValueToKotlin(typography, allTokens, options, importCollector) {
        // Reference full typography token if set
        const reference = (0, TokenHelper_1.sureOptionalReference)(typography.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        importCollector.use(ImportFlag.TextStyle, ImportFlag.TextDecoration);
        // Resolve partial references
        const fontFamilyRef = (0, TokenHelper_1.sureOptionalReference)(typography.fontFamily.referencedTokenId, allTokens, options.allowReferences);
        const fontWeightRef = (0, TokenHelper_1.sureOptionalReference)(typography.fontWeight.referencedTokenId, allTokens, options.allowReferences);
        const decorationRef = (0, TokenHelper_1.sureOptionalReference)(typography.textDecoration.referencedTokenId, allTokens, options.allowReferences);
        // Calculate literals
        const fontFamilyLit = fontFamilyRef ? options.tokenToVariableRef(fontFamilyRef) : `"${typography.fontFamily.text}"`;
        const fontWeightLit = fontWeightRef
            ? options.tokenToVariableRef(fontWeightRef)
            : this.fontWeightIntToKotlin((0, TokenHelper_1.normalizeTextWeight)(typography.fontWeight.text), importCollector);
        const textDecorationLit = decorationRef
            ? options.tokenToVariableRef(decorationRef)
            : typography.textDecoration.value === sdk_exporters_1.TextDecoration.original
                ? "TextDecoration.None"
                : this.textDecorationToKotlin(typography.textDecoration.value, importCollector);
        const fontSizeLit = this.dimensionTokenValueToKotlin(typography.fontSize, allTokens, options, importCollector);
        const lineHeightLit = typography.lineHeight
            ? this.dimensionTokenValueToKotlin(typography.lineHeight, allTokens, options, importCollector)
            : undefined;
        const letterSpacingLit = typography.letterSpacing
            ? this.dimensionTokenValueToKotlin(typography.letterSpacing, allTokens, options, importCollector)
            : undefined;
        // Assemble TextStyle literal
        const parts = [
            `fontFamily = ${fontFamilyLit}`,
            `fontWeight = ${fontWeightLit}`,
            `fontSize = ${fontSizeLit}`
        ];
        if (lineHeightLit)
            parts.push(`lineHeight = ${lineHeightLit}`);
        if (letterSpacingLit)
            parts.push(`letterSpacing = ${letterSpacingLit}`);
        if (textDecorationLit)
            parts.push(`textDecoration = ${textDecorationLit}`);
        const indentString = GeneralHelper_1.GeneralHelper.indent(options.indent);
        // Join with commas and indents
        const body = parts.map((p) => `${indentString}${indentString}${p}`).join(",\n");
        return `TextStyle(\n${body}\n${indentString})`;
    }
}
exports.KotlinHelper = KotlinHelper;
