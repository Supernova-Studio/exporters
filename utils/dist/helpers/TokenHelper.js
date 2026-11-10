"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sureOptionalReference = sureOptionalReference;
exports.normalizeTextWeight = normalizeTextWeight;
/** Finds reference and makes sure it exists if reference was provided. If null was provided, null is on the output as well to make seeking outside few lines smaller */
function sureOptionalReference(referenceId, allTokens, allowReferences = true) {
    if (!referenceId || !allowReferences) {
        return null;
    }
    const token = allTokens.get(referenceId);
    if (!token) {
        throw new Error(`Trying to retrieve unknown referenced token ${referenceId}`);
    }
    return token;
}
function normalizeTextWeight(weight) {
    // Convert to lowercase for case-insensitive comparison
    const normalizedText = weight.toLowerCase().trim();
    // First, check if it's already a valid number
    const numericWeight = parseInt(normalizedText);
    if (!isNaN(numericWeight)) {
        return numericWeight;
    }
    // Map common weight names to their numeric values
    switch (normalizedText) {
        case "thin":
            return 100;
        case "hairline":
            return 100;
        case "extra light":
        case "extralight":
        case "ultra light":
        case "ultralight":
            return 200;
        case "light":
            return 300;
        case "normal":
        case "regular":
        case "book":
            return 400;
        case "medium":
            return 500;
        case "semi bold":
        case "semibold":
        case "demi bold":
        case "demibold":
            return 600;
        case "bold":
            return 700;
        case "extra bold":
        case "extrabold":
        case "ultra bold":
        case "ultrabold":
            return 800;
        case "black":
        case "heavy":
            return 900;
        default:
            // Default to normal weight (400) if the value is not recognized
            return 400;
    }
}
