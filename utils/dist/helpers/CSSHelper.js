"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSHelper = void 0;
const sdk_exporters_1 = require("@supernovaio/sdk-exporters");
const ColorFormat_1 = require("../enums/ColorFormat");
const TokenHelper_1 = require("./TokenHelper");
const ColorHelper_1 = require("./ColorHelper");
/** A utility class to help with transformation of tokens and Supernova token-like values to various formats */
class CSSHelper {
    /**
     * Helper function to handle color with custom opacity, using channel-based utilities when available
     */
    static handleColorWithCustomOpacity(color, customOpacity, allTokens, options) {
        if (customOpacity && color.referencedTokenId) {
            // If we have custom opacity and reference a color token, try to use channel-based utility
            const referencedColorToken = allTokens.get(color.referencedTokenId);
            if (referencedColorToken && referencedColorToken.tokenType === sdk_exporters_1.TokenType.color) {
                const channelVariableName = options.tokenToVariableRef(referencedColorToken, { needsRgb: true });
                const alphaValue = ColorHelper_1.ColorHelper.roundToDecimals(customOpacity.measure, options.decimals);
                // Use the appropriate function based on color format
                if (options.colorFormat === ColorFormat_1.ColorFormat.oklch ||
                    options.colorFormat === ColorFormat_1.ColorFormat.oklcha ||
                    options.colorFormat === ColorFormat_1.ColorFormat.smartOklch) {
                    return `oklch(${channelVariableName} / ${alphaValue})`;
                }
                else {
                    // Default to rgba for other formats (rgb, rgba, smartRgba, etc.)
                    return `rgba(${channelVariableName}, ${alphaValue})`;
                }
            }
        }
        // Fallback to normal color processing
        return this.colorTokenValueToCSS({
            ...color,
            ...(customOpacity && { opacity: customOpacity })
        }, allTokens, options);
    }
    static tokenToCSS(token, allTokens, options) {
        /** Use subroutines to convert specific token types to different css representations. Many tokens are of the same type */
        let cssValue;
        switch (token.tokenType) {
            case sdk_exporters_1.TokenType.color:
                cssValue = this.colorTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.border:
                cssValue = this.borderTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.gradient:
                cssValue = this.gradientTokenValueToCSS(token.value, allTokens, options);
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
                cssValue = this.dimensionTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.shadow:
                cssValue = this.shadowTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.fontWeight:
                cssValue = this.fontWeightTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.fontFamily:
            case sdk_exporters_1.TokenType.productCopy:
            case sdk_exporters_1.TokenType.string:
                cssValue = this.stringTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.textCase:
            case sdk_exporters_1.TokenType.textDecoration:
            case sdk_exporters_1.TokenType.visibility:
                cssValue = this.optionTokenValueToCSS(token.value, allTokens, options, token.tokenType);
                break;
            case sdk_exporters_1.TokenType.blur:
                cssValue = this.blurTokenValueToCSS(token.value, allTokens, options);
                break;
            case sdk_exporters_1.TokenType.typography:
                cssValue = this.typographyTokenValueToCSS(token.value, allTokens, options);
                break;
            default:
                throw new sdk_exporters_1.UnreachableCaseError(token.tokenType, 'Unsupported token type for transformation to CSS:');
        }
        // Allow value transformation if transformer exists
        if (options.valueTransformer) {
            const transformedValue = options.valueTransformer(cssValue, token);
            if (transformedValue !== undefined) {
                return transformedValue;
            }
        }
        return cssValue;
    }
    static colorTokenValueToCSS(color, allTokens, options) {
        return ColorHelper_1.ColorHelper.formattedColorOrVariableName(color, allTokens, options);
    }
    static borderTokenValueToCSS(border, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(border.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Handle color with custom opacity using helper function
        const colorValue = this.handleColorWithCustomOpacity(border.color, border.color.opacity, allTokens, options);
        const data = {
            width: this.dimensionTokenValueToCSS(border.width, allTokens, options),
            style: this.borderStyleToCSS(border.style),
            color: colorValue,
            position: this.borderPositionToCSS(border.position) // Not used for now
        };
        return `${data.width} ${data.style} ${data.color}`;
    }
    static gradientTokenValueToCSS(gradients, allTokens, options) {
        // Export each layer of the gradient separately, then join the CSS background
        return gradients.map((gradient) => this.gradientLayerToCSS(gradient, allTokens, options)).join(', ');
    }
    /** Converts gradient token value to css definition */
    static gradientLayerToCSS(value, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        const deltaX = ColorHelper_1.ColorHelper.roundToDecimals(value.to.x, options.decimals) -
            ColorHelper_1.ColorHelper.roundToDecimals(value.from.x, options.decimals);
        const deltaY = ColorHelper_1.ColorHelper.roundToDecimals(value.to.y, options.decimals) -
            ColorHelper_1.ColorHelper.roundToDecimals(value.from.y, options.decimals);
        const rad = Math.atan2(deltaY, deltaX);
        const deg = rad * (180 / Math.PI);
        const getAngle = () => {
            if (deltaX >= 0 && deltaY > 0) {
                // top to bottom is 90deg but should be 180deg
                return 90 + deg;
            }
            if (deltaX > 0 && deltaY <= 0) {
                // left to right is 0deg but should be 90deg
                return 90 + deg;
            }
            if (deltaX <= 0 && deltaY < 0) {
                // bottom to top is -90deg but should be 0deg
                return 90 + deg;
            }
            // right to left is 180deg but should be -90deg
            return deg - 270;
        };
        let gradientType = '';
        switch (value.type) {
            case sdk_exporters_1.GradientType.linear:
                gradientType = `linear-gradient(${getAngle()}deg, `;
                break;
            case sdk_exporters_1.GradientType.radial:
                gradientType = 'radial-gradient(circle, ';
                break;
            case sdk_exporters_1.GradientType.angular:
                gradientType = 'conic-gradient(';
                break;
            default:
                gradientType = `linear-gradient(${getAngle()}deg, `;
                break;
        }
        // Example: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
        const stops = value.stops
            .map((stop) => {
            // Handle color with custom opacity using helper function
            const colorValue = this.handleColorWithCustomOpacity(stop.color, stop.color.opacity, allTokens, options);
            return `${colorValue} ${ColorHelper_1.ColorHelper.roundToDecimals(stop.position * 100, options.decimals)}%`;
        })
            .join(', ');
        return `${gradientType}${stops})`;
    }
    static dimensionTokenValueToCSS(dimension, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(dimension.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Handle unit conversion if needed
        if (options.forceRemUnit && dimension.unit === sdk_exporters_1.Unit.pixels) {
            const remBase = options.remBase || 16;
            const remValue = dimension.measure / remBase;
            return `${ColorHelper_1.ColorHelper.roundToDecimals(remValue, options.decimals)}rem`;
        }
        return `${ColorHelper_1.ColorHelper.roundToDecimals(dimension.measure, options.decimals)}${this.unitToCSS(dimension.unit)}`;
    }
    static shadowTokenValueToCSS(shadows, allTokens, options) {
        return shadows.map((layer) => this.shadowLayerToCSS(layer, allTokens, options)).join(', ');
    }
    static shadowLayerToCSS(value, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Convert pixel values to rem if needed
        const convertToRem = (px) => {
            if (options.forceRemUnit) {
                const remBase = options.remBase || 16;
                const remValue = px / remBase;
                return `${ColorHelper_1.ColorHelper.roundToDecimals(remValue, options.decimals)}rem`;
            }
            return `${px}px`;
        };
        // Handle color with custom opacity using helper function
        const colorValue = this.handleColorWithCustomOpacity(value.color, value.opacity, allTokens, options);
        return `${value.type === sdk_exporters_1.ShadowType.inner ? 'inset ' : ''}${convertToRem(value.x)} ${convertToRem(value.y)} ${convertToRem(value.radius)} ${convertToRem(value.spread)} ${colorValue}`;
    }
    static fontWeightTokenValueToCSS(value, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Convert text weights to numerical values
        const normalizedWeight = (0, TokenHelper_1.normalizeTextWeight)(value.text);
        return `${normalizedWeight}`;
    }
    static stringTokenValueToCSS(value, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(value.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        return `"${value.text}"`;
    }
    static optionTokenValueToCSS(option, allTokens, options, tokenType) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(option.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        if (tokenType === sdk_exporters_1.TokenType.textCase) {
            return this.textCaseToCSS(option.value);
        }
        if (tokenType === sdk_exporters_1.TokenType.textDecoration) {
            return this.textDecorationToCSS(option.value);
        }
        // Visibility values are supported in CSS as is our data model
        return option.value.toLowerCase();
    }
    static blurTokenValueToCSS(blur, allTokens, options) {
        const reference = (0, TokenHelper_1.sureOptionalReference)(blur.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        return `blur(${this.dimensionTokenValueToCSS(blur.radius, allTokens, options)})`;
    }
    static typographyTokenValueToCSS(typography, allTokens, options) {
        // Reference full typography token if set
        const reference = (0, TokenHelper_1.sureOptionalReference)(typography.referencedTokenId, allTokens, options.allowReferences);
        if (reference) {
            return options.tokenToVariableRef(reference);
        }
        // Resolve partial references
        const fontFamilyReference = (0, TokenHelper_1.sureOptionalReference)(typography.fontFamily.referencedTokenId, allTokens, options.allowReferences);
        const fontWeightReference = (0, TokenHelper_1.sureOptionalReference)(typography.fontWeight.referencedTokenId, allTokens, options.allowReferences);
        const decorationReference = (0, TokenHelper_1.sureOptionalReference)(typography.textDecoration.referencedTokenId, allTokens, options.allowReferences);
        const caseReference = (0, TokenHelper_1.sureOptionalReference)(typography.textCase.referencedTokenId, allTokens, options.allowReferences);
        const data = {
            fontFamily: fontFamilyReference ? options.tokenToVariableRef(fontFamilyReference) : typography.fontFamily.text,
            fontWeight: fontWeightReference
                ? options.tokenToVariableRef(fontWeightReference)
                : (0, TokenHelper_1.normalizeTextWeight)(typography.fontWeight.text),
            textDecoration: decorationReference
                ? options.tokenToVariableRef(decorationReference)
                : typography.textDecoration.value === sdk_exporters_1.TextDecoration.original
                    ? this.textDecorationToCSS(typography.textDecoration.value)
                    : undefined,
            textCase: caseReference
                ? options.tokenToVariableRef(caseReference)
                : typography.textCase.value === sdk_exporters_1.TextCase.original
                    ? this.textCaseToCSS(typography.textCase.value)
                    : undefined,
            caps: typography.textCase.value === sdk_exporters_1.TextCase.smallCaps,
            fontSize: this.dimensionTokenValueToCSS(typography.fontSize, allTokens, options),
            lineHeight: typography.lineHeight
                ? this.dimensionTokenValueToCSS(typography.lineHeight, allTokens, options)
                : undefined
        };
        // Formal CSS definition: font-style, font-variant, font-weight, font-stretch, font-size, line-height, and font-family.
        // Example: small-caps bold 24px/1rem "Wingdings"
        const fragmentCaps = data.caps ? 'small-caps ' : '';
        const fragmentWeight = data.fontWeight;
        const fragmentSize = data.fontSize;
        const fragmentLineHeight = data.lineHeight;
        const fragmentSizeAndLineHeight = data.lineHeight ? `${fragmentSize}/${fragmentLineHeight}` : fragmentSize;
        const fragmentFamily = fontFamilyReference ? data.fontFamily : `\"${data.fontFamily}\"`;
        return `${fragmentCaps}${fragmentWeight} ${fragmentSizeAndLineHeight} ${fragmentFamily}`;
    }
    static borderStyleToCSS(borderStyle) {
        switch (borderStyle) {
            case sdk_exporters_1.BorderStyle.dashed:
                return 'dashed';
            case sdk_exporters_1.BorderStyle.dotted:
                return 'dotted';
            case sdk_exporters_1.BorderStyle.solid:
                return 'solid';
            case sdk_exporters_1.BorderStyle.groove:
                return 'groove';
            default:
                return 'solid';
        }
    }
    static borderPositionToCSS(borderPosition) {
        switch (borderPosition) {
            case sdk_exporters_1.BorderPosition.center:
                return 'center';
            case sdk_exporters_1.BorderPosition.inside:
                return 'inside';
            case sdk_exporters_1.BorderPosition.outside:
                return 'outside';
            default:
                return 'outside';
        }
    }
    static unitToCSS(unit) {
        switch (unit) {
            case sdk_exporters_1.Unit.percent:
                return '%';
            case sdk_exporters_1.Unit.pixels:
                return 'px';
            case sdk_exporters_1.Unit.rem:
                return 'rem';
            case sdk_exporters_1.Unit.raw:
                return '';
            case sdk_exporters_1.Unit.ms:
                return 'ms';
            default:
                return 'px';
        }
    }
    static textCaseToCSS(textCase) {
        switch (textCase) {
            case sdk_exporters_1.TextCase.original:
                return 'none';
            case sdk_exporters_1.TextCase.upper:
                return 'uppercase';
            case sdk_exporters_1.TextCase.lower:
                return 'lowercase';
            case sdk_exporters_1.TextCase.camel:
                return 'capitalize';
            case sdk_exporters_1.TextCase.smallCaps:
                return 'small-caps';
        }
    }
    static textDecorationToCSS(textDecoration) {
        switch (textDecoration) {
            case sdk_exporters_1.TextDecoration.original:
                return 'none';
            case sdk_exporters_1.TextDecoration.underline:
                return 'underline';
            case sdk_exporters_1.TextDecoration.strikethrough:
                return 'line-through';
        }
    }
}
exports.CSSHelper = CSSHelper;
