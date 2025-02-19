"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamingHelper = void 0;
const StringCase_1 = require("../enums/StringCase");
const change_case_1 = require("change-case");
class NamingHelper {
    static codeSafeVariableNameForToken(token, format, parent, prefix, collectionName, globalPrefix) {
        // Create array with all path segments and token name at the end
        let fragments = [];
        // Add global prefix first if provided
        if (globalPrefix && globalPrefix.length > 0) {
            fragments.push(globalPrefix.trim());
        }
        // Add type-specific prefix if provided
        if (prefix && prefix.length > 0) {
            fragments.push(prefix);
        }
        // Add collection name if provided
        if (collectionName && collectionName.length > 0) {
            fragments.push(collectionName);
        }
        // Add parent path and name
        if (parent) {
            fragments.push(...parent.path);
            if (!parent.isRoot) {
                fragments.push(parent.name);
            }
        }
        // Add token name last
        fragments.push(token.name);
        return NamingHelper.codeSafeVariableName(fragments, format);
    }
    /**
     * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
     * if they contain spaces, case changes from one letter to another and so on.
     *
     * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
     */
    static codeSafeVariableName(fragments, format) {
        let sentence = typeof fragments === 'string' ? fragments : fragments.join(' ');
        // Only allow letters, digits, underscore and hyphen
        sentence = sentence.replaceAll(/[^a-zA-Z0-9_-]/g, '_');
        switch (format) {
            case StringCase_1.StringCase.camelCase:
                sentence = (0, change_case_1.camelCase)(sentence);
                break;
            case StringCase_1.StringCase.capitalCase:
                sentence = (0, change_case_1.capitalCase)(sentence);
                break;
            case StringCase_1.StringCase.constantCase:
                sentence = (0, change_case_1.constantCase)(sentence);
                break;
            case StringCase_1.StringCase.dotCase:
                sentence = (0, change_case_1.dotCase)(sentence);
                break;
            case StringCase_1.StringCase.trainCase:
                sentence = (0, change_case_1.trainCase)(sentence);
                break;
            case StringCase_1.StringCase.noCase:
                sentence = (0, change_case_1.noCase)(sentence);
                break;
            case StringCase_1.StringCase.kebabCase:
                sentence = (0, change_case_1.kebabCase)(sentence);
                break;
            case StringCase_1.StringCase.pascalCase:
                sentence = (0, change_case_1.pascalCase)(sentence);
                break;
            case StringCase_1.StringCase.pathCase:
                sentence = (0, change_case_1.pathCase)(sentence);
                break;
            case StringCase_1.StringCase.sentenceCase:
                sentence = (0, change_case_1.sentenceCase)(sentence);
                break;
            case StringCase_1.StringCase.snakeCase:
                sentence = (0, change_case_1.snakeCase)(sentence);
                break;
            case StringCase_1.StringCase.flatCase:
                sentence = (0, change_case_1.camelCase)(sentence).toLowerCase();
                break;
            default:
                break;
        }
        // Remove all underscores if format is not snake_case, since the library has unintended behavior with numberic values in this case
        if (format !== StringCase_1.StringCase.snakeCase && format !== StringCase_1.StringCase.constantCase) {
            sentence = sentence.replaceAll('_', '');
        }
        // If variable starts with anything but letter, add "_" in front of it
        if (sentence.match(/^[^a-zA-Z]/)) {
            sentence = '_' + sentence;
        }
        return sentence;
    }
    /** Convert any string to CSS variable reference */
    static nameAsCSSVarReference(name) {
        return `var(--${name})`;
    }
    /** Convert any string to CSS variable declaration */
    static nameAsCSSVarDeclaration(name) {
        return `--${name}`;
    }
}
exports.NamingHelper = NamingHelper;
