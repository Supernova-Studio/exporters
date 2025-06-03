"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileNameHelper = void 0;
const StringCase_1 = require("../enums/StringCase");
const NamingHelper_1 = require("./NamingHelper");
class FileNameHelper {
    /**
     * Ensures a filename has the correct extension
     */
    static ensureFileExtension(fileName, extension) {
        // Ensure extension starts with a dot
        const normalizedExtension = extension.startsWith(".") ? extension : `.${extension}`;
        if (!fileName.toLowerCase().endsWith(normalizedExtension.toLowerCase())) {
            return fileName + normalizedExtension;
        }
        return fileName;
    }
    /**
     * Replaces file extension
     */
    static replaceFileExtension(fileName, oldExt, newExt) {
        // Ensure extensions start with a dot
        const normalizedOldExt = oldExt.startsWith(".") ? oldExt : `.${oldExt}`;
        const normalizedNewExt = newExt.startsWith(".") ? newExt : `.${newExt}`;
        return fileName.replace(new RegExp(`${normalizedOldExt}$`), normalizedNewExt);
    }
    /**
     * Gets the default style file name for a token type
     */
    static getDefaultStyleFileName(type, extension = ".css", stringCase = StringCase_1.StringCase.kebabCase) {
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
        // Ensure the extension starts with a dot
        const normalizedExtension = extension.startsWith(".") ? extension : `.${extension}`;
        return NamingHelper_1.NamingHelper.codeSafeVariableName(baseNames[type], stringCase) + normalizedExtension;
    }
}
exports.FileNameHelper = FileNameHelper;
