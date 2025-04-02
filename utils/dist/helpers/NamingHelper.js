"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamingHelper = void 0;
const StringCase_1 = require("../enums/StringCase");
const change_case_1 = require("change-case");
class NamingHelper {
    static codeSafeVariableNameForToken(token, format, parent, prefix, findReplace) {
        // Step 1: Create array with all path segments and token name at the end
        let fragments = [];
        if (parent) {
            fragments = [...parent.path];
            if (!parent.isRoot) {
                fragments.push(parent.name);
            }
        }
        // Step 2: Handle token name intelligently to avoid word-level duplication
        // For example, if the path ends with "Red" and token name is "Red 500",
        // we only want to add "500" to avoid "Red Red 500"
        const tokenNameParts = token.name.split(/[\s-_]+/);
        // This checks if the first word of token name matches the last fragment (case insensitive)
        // and if so, only adds the remaining parts of the token name
        if (fragments.length > 0 && tokenNameParts.length > 1 &&
            tokenNameParts[0].toLowerCase() === fragments[fragments.length - 1].toLowerCase()) {
            fragments.push(tokenNameParts.slice(1).join(' '));
        }
        else {
            fragments.push(token.name);
        }
        // Step 3: Apply find/replace to path and name fragments only (not prefix)
        // This allows for custom text replacements in the variable name
        if (findReplace) {
            // Sort find patterns by length (longest first) to handle overlapping patterns
            const sortedPatterns = Object.entries(findReplace)
                .sort(([a], [b]) => b.length - a.length);
            // Join path and name for find/replace processing
            let pathAndName = fragments.join(' ');
            for (const [find, replace] of sortedPatterns) {
                // Escape special regex characters to ensure they're treated as literal characters
                const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Create a regex pattern that matches the word in two ways:
                // 1. Using standard word boundaries (\b) - matches transitions between word/non-word chars
                // 2. Using lookahead/lookbehind to match at string boundaries or between spaces
                //    This handles cases where \b alone might not work correctly
                const pattern = new RegExp(
                // Part 1: Match with standard word boundaries
                `\\b${escapedFind}\\b|` +
                    // Part 2: Match at start of string or after space AND before end of string or space
                    `(?<=^|\\s)${escapedFind}(?=\\s|$)`, 'gi' // g: global (match all occurrences), i: case-insensitive
                );
                // Replace all occurrences with the replacement string
                pathAndName = pathAndName.replace(pattern, replace);
            }
            // Split back into fragments and clean up
            fragments = pathAndName
                .split(/\s+/)
                .filter(f => f.length > 0)
                .map(f => f.trim());
        }
        // Step 4: Add prefix after find/replace (prefix should not be affected by find/replace)
        if (prefix && prefix.length > 0) {
            fragments.unshift(prefix);
        }
        // Step 5: Remove fragment-level consecutive duplicates
        // This handles cases where entire fragments are duplicated
        // For example, ["color", "border", "border"] becomes ["color", "border"]
        // First convert to kebabCase for normalization
        const normalizedString = (0, change_case_1.kebabCase)(fragments.join(' '));
        // Split by "-" to get new fragments
        const normalizedFragments = normalizedString.split('-').filter(f => f.length > 0);
        // Remove duplicates from normalized fragments
        const uniqueFragments = normalizedFragments.filter((fragment, index) => {
            // Keep if it's first element or different from previous
            return index === 0 || fragment !== normalizedFragments[index - 1];
        });
        // Step 6: Apply case formatting to the final fragments
        return NamingHelper.codeSafeVariableName(uniqueFragments, format);
    }
    /**
     * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
     * if they contain spaces, case changes from one letter to another and so on.
     *
     * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
     */
    static codeSafeVariableName(fragments, format, findReplace) {
        // Convert fragments to a single sentence for processing
        let sentence = typeof fragments === 'string' ? fragments : fragments.join(' ');
        // Apply find/replace if provided
        if (findReplace) {
            // Sort find patterns by length (longest first) to handle overlapping patterns
            const sortedPatterns = Object.entries(findReplace)
                .sort(([a], [b]) => b.length - a.length);
            for (const [find, replace] of sortedPatterns) {
                // Escape special regex characters to ensure they're treated as literal characters
                const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Create a regex pattern that matches the word in two ways:
                // 1. Using standard word boundaries (\b) - matches transitions between word/non-word chars
                // 2. Using lookahead/lookbehind to match at string boundaries or between spaces
                //    This handles cases where \b alone might not work correctly
                const pattern = new RegExp(
                // Part 1: Match with standard word boundaries
                `\\b${escapedFind}\\b|` +
                    // Part 2: Match at start of string or after space AND before end of string or space
                    `(?<=^|\\s)${escapedFind}(?=\\s|$)`, 'gi' // g: global (match all occurrences), i: case-insensitive
                );
                // Replace all occurrences with the replacement string
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
