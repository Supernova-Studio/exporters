"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamingHelper = void 0;
const StringCase_1 = require("../enums/StringCase");
const change_case_1 = require("change-case");
class NamingHelper {
    static codeSafeVariableNameForToken(token, format, parent, prefix, findReplace) {
        // Create array with all path segments and token name at the end
        let fragments = [];
        if (parent) {
            fragments = [...parent.path];
            if (!parent.isRoot) {
                fragments.push(parent.name);
            }
        }
        // Split token name into words
        const tokenNameParts = token.name.split(/[\s-_]+/);
        // If the first word of token name matches the last fragment (case insensitive),
        // only add the remaining parts of the token name
        if (fragments.length > 0 && tokenNameParts.length > 1 &&
            tokenNameParts[0].toLowerCase() === fragments[fragments.length - 1].toLowerCase()) {
            fragments.push(tokenNameParts.slice(1).join(' '));
        }
        else {
            fragments.push(token.name);
        }
        // Apply find/replace to path and name fragments *first*
        if (findReplace) {
            // Sort find patterns by length (longest first) to handle overlapping patterns
            const sortedPatterns = Object.entries(findReplace)
                .sort(([a], [b]) => b.length - a.length);
            // Join path and name for find/replace processing
            let pathAndName = fragments.join(' ');
            for (const [find, replace] of sortedPatterns) {
                // Create a case-insensitive pattern that matches the word
                // Use a more flexible pattern that handles word boundaries better
                const pattern = new RegExp(`\\b${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b|(?<=^|\\s)${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'gi');
                pathAndName = pathAndName.replace(pattern, replace);
            }
            // Split back into fragments and clean up
            fragments = pathAndName
                .split(/\s+/)
                .filter(f => f.length > 0)
                .map(f => f.trim());
        }
        // Add prefix *after* find/replace
        if (prefix && prefix.length > 0) {
            fragments.unshift(prefix);
        }
        // Remove consecutive duplicates *after* adding prefix
        fragments = fragments.filter((fragment, index) => {
            // Keep if it's first element or different from previous
            return index === 0 || fragment.toLowerCase() !== fragments[index - 1].toLowerCase();
        });
        // Apply case formatting
        return NamingHelper.codeSafeVariableName(fragments, format);
    }
    /**
     * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
     * if they contain spaces, case changes from one letter to another and so on.
     *
     * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
     */
    static codeSafeVariableName(fragments, format, findReplace) {
        let sentence = typeof fragments === 'string' ? fragments : fragments.join(' ');
        // Apply find/replace if provided
        if (findReplace) {
            // Sort find patterns by length (longest first) to handle overlapping patterns
            const sortedPatterns = Object.entries(findReplace)
                .sort(([a], [b]) => b.length - a.length);
            for (const [find, replace] of sortedPatterns) {
                // Create a case-insensitive pattern that matches the word
                // Use a more flexible pattern that handles word boundaries better
                const pattern = new RegExp(`\\b${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b|(?<=^|\\s)${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'gi');
                sentence = sentence.replace(pattern, replace);
            }
        }
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
