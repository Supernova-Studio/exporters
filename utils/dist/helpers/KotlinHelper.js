"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KotlinHelper = exports.ImportCollector = exports.ImportFlag = void 0;
const sdk_exporters_1 = require("@supernovaio/sdk-exporters");
const ColorHelper_1 = require("./ColorHelper");
const TokenHelper_1 = require("./TokenHelper");
const GeneralHelper_1 = require("./GeneralHelper");
const NamingHelper_1 = require("./NamingHelper");
const StringCase_1 = require("../enums/StringCase");
const ColorFormat_1 = require("../enums/ColorFormat");
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports & flag enum
var ImportFlag;
(function (ImportFlag) {
    ImportFlag[ImportFlag["Color"] = 0] = "Color";
    ImportFlag[ImportFlag["Dp"] = 1] = "Dp";
    ImportFlag[ImportFlag["Sp"] = 2] = "Sp";
    ImportFlag[ImportFlag["Em"] = 3] = "Em";
    ImportFlag[ImportFlag["Offset"] = 4] = "Offset";
    ImportFlag[ImportFlag["Brush"] = 5] = "Brush";
    ImportFlag[ImportFlag["TileMode"] = 6] = "TileMode";
    ImportFlag[ImportFlag["Shadow"] = 7] = "Shadow";
    ImportFlag[ImportFlag["BorderStroke"] = 8] = "BorderStroke";
    ImportFlag[ImportFlag["Modifier"] = 9] = "Modifier";
    ImportFlag[ImportFlag["Blur"] = 10] = "Blur";
    ImportFlag[ImportFlag["Font"] = 11] = "Font";
    ImportFlag[ImportFlag["FontFamily"] = 12] = "FontFamily";
    ImportFlag[ImportFlag["FontWeight"] = 13] = "FontWeight";
    ImportFlag[ImportFlag["TextDecoration"] = 14] = "TextDecoration";
    ImportFlag[ImportFlag["TextStyle"] = 15] = "TextStyle";
    ImportFlag[ImportFlag["R"] = 16] = "R";
})(ImportFlag || (exports.ImportFlag = ImportFlag = {}));
/** Collect flags while generating literals, turn into imports at the end */
class ImportCollector {
    constructor(rPackageName) {
        this.rPackageName = rPackageName;
        this.importFlags = new Set();
    }
    /**
     * Marks a specific feature to be imported.
     * @param flags
     */
    use(...flags) {
        flags.forEach((x) => this.importFlags.add(x));
    }
    /**
     * Output a list of all sorted import literals needed for the specified tokens.
     */
    allImports() {
        const importList = [];
        if (this.rPackageName && this.importFlags.has(ImportFlag.R)) {
            importList.push(`import ${this.rPackageName}.R`);
        }
        if (this.importFlags.has(ImportFlag.Color))
            importList.push("import androidx.compose.ui.graphics.Color");
        if (this.importFlags.has(ImportFlag.Dp))
            importList.push("import androidx.compose.ui.unit.dp");
        if (this.importFlags.has(ImportFlag.Sp))
            importList.push("import androidx.compose.ui.unit.sp");
        if (this.importFlags.has(ImportFlag.Em))
            importList.push("import androidx.compose.ui.unit.em");
        if (this.importFlags.has(ImportFlag.Offset))
            importList.push("import androidx.compose.ui.geometry.Offset");
        if (this.importFlags.has(ImportFlag.Brush))
            importList.push("import androidx.compose.ui.graphics.Brush");
        if (this.importFlags.has(ImportFlag.TileMode))
            importList.push("import androidx.compose.ui.graphics.TileMode");
        if (this.importFlags.has(ImportFlag.Shadow))
            importList.push("import androidx.compose.ui.graphics.Shadow");
        if (this.importFlags.has(ImportFlag.BorderStroke))
            importList.push("import androidx.compose.foundation.BorderStroke");
        if (this.importFlags.has(ImportFlag.Modifier)) {
            importList.push("import androidx.compose.ui.Modifier");
            if (this.importFlags.has(ImportFlag.Blur))
                importList.push("import androidx.compose.ui.draw.blur");
        }
        if (this.importFlags.has(ImportFlag.FontFamily))
            importList.push("import androidx.compose.ui.text.font.FontFamily");
        if (this.importFlags.has(ImportFlag.Font))
            importList.push("import androidx.compose.ui.text.font.Font");
        if (this.importFlags.has(ImportFlag.FontWeight))
            importList.push("import androidx.compose.ui.text.font.FontWeight");
        if (this.importFlags.has(ImportFlag.TextDecoration))
            importList.push("import androidx.compose.ui.text.style.TextDecoration");
        if (this.importFlags.has(ImportFlag.TextStyle))
            importList.push("import androidx.compose.ui.text.TextStyle");
        return importList.sort();
    }
}
exports.ImportCollector = ImportCollector;
/**
 * A utility class for working with Kotlin code generation for various token types.
 * This class provides methods to transform design tokens (e.g., colors, borders, gradients, shadows) into Kotlin representations.
 */
class KotlinHelper {
    /**
     * Converts a given token to its Kotlin string representation based on its type.
     *
     * @param token - The token to be converted.
     * @param allTokens - A map of all tokens, used for reference during conversion.
     * @param options - The options used to customize the token conversion process.
     * @param importCollector - An object responsible for managing and collecting imports needed for the Kotlin representation.
     * @return The Kotlin string representation of the given token.
     */
    static tokenValue(token, allTokens, options, importCollector) {
        /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
        let value;
        switch (token.tokenType) {
            case sdk_exporters_1.TokenType.color:
                value = this.colorTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.border:
                value = this.borderTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.gradient:
                value = this.gradientTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.fontSize:
            case sdk_exporters_1.TokenType.lineHeight:
                value = this.textUnitTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.letterSpacing:
                value = this.letterSpacingTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.dimension:
            case sdk_exporters_1.TokenType.size:
            case sdk_exporters_1.TokenType.space:
            case sdk_exporters_1.TokenType.opacity:
            case sdk_exporters_1.TokenType.paragraphSpacing:
            case sdk_exporters_1.TokenType.borderWidth:
            case sdk_exporters_1.TokenType.radius:
            case sdk_exporters_1.TokenType.duration:
            case sdk_exporters_1.TokenType.zIndex:
                value = this.dimensionTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.shadow:
                value = this.shadowTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.fontWeight:
                value = this.fontWeightTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.fontFamily:
                value = this.fontFamilyTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.productCopy:
            case sdk_exporters_1.TokenType.string:
                value = this.stringTokenValueToKotlin(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.textCase:
            case sdk_exporters_1.TokenType.textDecoration:
            case sdk_exporters_1.TokenType.visibility:
                value = this.optionTokenValueToKotlin(token.value, allTokens, options, token.tokenType, importCollector);
                break;
            case sdk_exporters_1.TokenType.blur:
                value = this.blurTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            case sdk_exporters_1.TokenType.typography:
                value = this.typographyTokenValueToKotlin(token.value, allTokens, options, importCollector);
                break;
            default:
                throw new sdk_exporters_1.UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:");
        }
        return value;
    }
    static colorTokenValueToKotlin(color, allTokens, options, importCollector) {
        importCollector.use(ImportFlag.Color);
        const colorOptions = {
            ...options,
            colorFormat: ColorFormat_1.ColorFormat.argbInt
        };
        return ColorHelper_1.ColorHelper.formattedColorOrVariableName(color, allTokens, colorOptions);
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
        // Builds "<pos>f to <colorLit>" pairs for var-arg overload
        const stopPairs = value.stops
            .map((s) => {
            const pos = ColorHelper_1.ColorHelper.roundToDecimals(s.position, options.decimals) + "f";
            const col = this.colorTokenValueToKotlin(s.color, allTokens, options, importCollector);
            return `${pos} to ${col}`;
        })
            .join(", ");
        const indent = GeneralHelper_1.GeneralHelper.indent(options.indent);
        switch (value.type) {
            case sdk_exporters_1.GradientType.radial: {
                importCollector.use(ImportFlag.TileMode);
                const centerX = ((value.from.x + value.to.x) / 2).toFixed(2);
                const centerY = ((value.from.y + value.to.y) / 2).toFixed(2);
                return (`Brush.radialGradient(\n` +
                    `${indent}${indent}${stopPairs},\n` +
                    `${indent}${indent}center = Offset(${centerX}f, ${centerY}f),\n` +
                    `${indent}${indent}radius = 0.5f,\n` +
                    `${indent}${indent}tileMode = TileMode.Clamp\n` +
                    `${indent})`);
            }
            case sdk_exporters_1.GradientType.angular: // sweep
                return (`Brush.sweepGradient(\n` +
                    `${indent}${indent}${stopPairs},\n` +
                    `${indent}${indent}center = Offset(0.5f, 0.5f)\n` +
                    `${indent})`);
            case sdk_exporters_1.GradientType.linear:
            default:
                return (`Brush.linearGradient(\n` +
                    `${indent}${indent}${stopPairs},\n` +
                    `${indent}${indent}start = Offset(${value.from.x}f, ${value.from.y}f),\n` +
                    `${indent}${indent}end = Offset(${value.to.x}f, ${value.to.y}f)\n` +
                    `${indent})`);
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
    /** Always output a Compose TextUnit value (sp or em) for typography tokens */
    static textUnitTokenValueToKotlin(dimension, allTokens, options, importCollector, useEmForPercent = false) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(dimension.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        const rounded = ColorHelper_1.ColorHelper.roundToDecimals(dimension.measure, options.decimals);
        if (dimension.unit === sdk_exporters_1.Unit.percent) {
            const fraction = +rounded / 100;
            importCollector.use(useEmForPercent ? ImportFlag.Em : ImportFlag.Sp);
            return `${fraction}${useEmForPercent ? ".em" : ".sp"}`;
        }
        importCollector.use(ImportFlag.Sp);
        return `${rounded}.sp`;
    }
    /**
     * Converts letter-spacing tokens to Compose TextUnit.
     * Percentage values correspond to em units, hence the final `true` flag.
     */
    static letterSpacingTokenValueToKotlin(dimension, allTokens, options, importCollector) {
        return this.textUnitTokenValueToKotlin(dimension, allTokens, options, importCollector, true);
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
    static fontFamilyTokenValueToKotlin(value, allTokens, options, importCollector) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Map font names to Android font resources using snake_case
        importCollector.use(ImportFlag.FontFamily, ImportFlag.Font, ImportFlag.R);
        const resName = NamingHelper_1.NamingHelper.codeSafeVariableName(value.text, StringCase_1.StringCase.snakeCase);
        return `FontFamily(Font(R.font.${resName}))`;
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
        const fontFamilyLit = fontFamilyRef
            ? options.tokenToVariableRef(fontFamilyRef)
            : this.fontFamilyTokenValueToKotlin(typography.fontFamily, allTokens, options, importCollector);
        const fontWeightLit = fontWeightRef
            ? options.tokenToVariableRef(fontWeightRef)
            : this.fontWeightIntToKotlin((0, TokenHelper_1.normalizeTextWeight)(typography.fontWeight.text), importCollector);
        const textDecorationLit = decorationRef
            ? options.tokenToVariableRef(decorationRef)
            : typography.textDecoration.value === sdk_exporters_1.TextDecoration.original
                ? "TextDecoration.None"
                : this.textDecorationToKotlin(typography.textDecoration.value, importCollector);
        const fontSizeLit = this.textUnitTokenValueToKotlin(typography.fontSize, allTokens, options, importCollector);
        const lineHeightLit = typography.lineHeight
            ? this.textUnitTokenValueToKotlin(typography.lineHeight, allTokens, options, importCollector)
            : undefined;
        const letterSpacingLit = typography.letterSpacing
            ? this.letterSpacingTokenValueToKotlin(typography.letterSpacing, allTokens, options, importCollector)
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
