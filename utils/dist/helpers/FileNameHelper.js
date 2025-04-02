"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileNameHelper = void 0;
class FileNameHelper {
    /**
     * Ensures a filename has the correct extension
     */
    static ensureFileExtension(fileName, extension) {
        if (!fileName.toLowerCase().endsWith(extension)) {
            return fileName + extension;
        }
        return fileName;
    }
    /**
     * Replaces file extension
     */
    static replaceFileExtension(fileName, oldExt, newExt) {
        return fileName.replace(new RegExp(`${oldExt}$`), newExt);
    }
    /**
     * Gets the default style file name for a token type
     */
    static getDefaultStyleFileName(type, extension = '.css') {
        const baseNames = {
            Color: "color",
            Typography: "typography",
            Dimension: "dimension",
            Size: "size",
            Space: "space",
            Opacity: "opacity",
            FontSize: "font-size",
            LineHeight: "line-height",
            LetterSpacing: "letter-spacing",
            ParagraphSpacing: "paragraph-spacing",
            BorderWidth: "border-width",
            BorderRadius: "border-radius",
            Duration: "duration",
            ZIndex: "z-index",
            Shadow: "shadow",
            Border: "border",
            Gradient: "gradient",
            String: "string",
            ProductCopy: "product-copy",
            FontFamily: "font-family",
            FontWeight: "font-weight",
            TextCase: "text-case",
            TextDecoration: "text-decoration",
            Visibility: "visibility",
            Blur: "blur"
        };
        return baseNames[type] + extension;
    }
}
exports.FileNameHelper = FileNameHelper;
