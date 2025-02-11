"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sureOptionalReference = sureOptionalReference;
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
