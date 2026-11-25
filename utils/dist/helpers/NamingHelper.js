"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamingHelper = void 0;
const StringCase_1 = require("../enums/StringCase");
const RepeatedWords_1 = require("../enums/RepeatedWords");
const change_case_1 = require("change-case");
class NamingHelper {
    /**
     * Helper method to apply find/replace patterns to a string
     * @param text The text to apply replacements to
     * @param findReplace Record of find/replace patterns
     * @returns The text with all replacements applied
     */
    static applyFindReplace(text, findReplace) {
        if (!findReplace)
            return text;
        // Sort find patterns by length (longest first) to handle overlapping patterns
        const sortedPatterns = Object.entries(findReplace)
            .sort(([a], [b]) => b.length - a.length);
        let result = text;
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
            result = result.replace(pattern, replace);
        }
        return result;
    }
    /**
     * Builds a token's variable name from the prefix, its group path and its name. By default, a word repeated where two
     * of these parts meet is written once ("Neutral" + "Neutral 500" → neutral-500); a word repeated inside one part is kept.
     */
    static codeSafeVariableNameForToken(token, format, parent, prefix, findReplace, repeatedWords = RepeatedWords_1.RepeatedWords.RemoveWhereFragmentsMeet) {
        // Create array with all path segments and token name at the end
        let fragments = [];
        // Add parent path and name
        if (parent) {
            fragments.push(...parent.path);
            if (!parent.isRoot) {
                fragments.push(parent.name);
            }
        }
        // Step 2: Handle token name intelligently to avoid word-level duplication
        // For example, if the path ends with "Red" and token name is "Red 500",
        // we only want to add "500" to avoid "Red Red 500"
        const tokenNameParts = token.name.split(/[\s-_]+/);
        // This checks if the first word of token name matches the last fragment (case insensitive)
        // and if so, appends the remaining parts of the token name to that fragment
        if (fragments.length > 0 && tokenNameParts.length > 1 &&
            tokenNameParts[0].toLowerCase() === fragments[fragments.length - 1].toLowerCase()) {
            fragments[fragments.length - 1] += ` ${tokenNameParts.slice(1).join(' ')}`;
        }
        else {
            fragments.push(token.name);
        }
        // Step 3: Apply find/replace to each path and name fragment (not prefix), keeping the fragments apart
        fragments = fragments.map((fragment) => NamingHelper.applyFindReplace(fragment, findReplace));
        // Step 4: Add prefix after find/replace (prefix should not be affected by find/replace)
        // Each prefix word is its own fragment, so "color" + collection "Color tokens" still collapses to color-tokens
        if (prefix && prefix.length > 0) {
            fragments.unshift(...(0, change_case_1.kebabCase)(prefix).split('-'));
        }
        // Step 5: Apply case formatting to the final fragments
        return NamingHelper.codeSafeVariableName(fragments, format, undefined, repeatedWords);
    }
    /**
     * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
     * if they contain spaces, case changes from one letter to another and so on.
     *
     * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
     */
    static codeSafeVariableName(fragments, format, findReplace, repeatedWords = RepeatedWords_1.RepeatedWords.Keep) {
        // Apply find/replace to each fragment, then only allow letters, digits, underscore and hyphen
        const cleanFragments = (typeof fragments === 'string' ? [fragments] : fragments).map((fragment) => NamingHelper.applyFindReplace(fragment, findReplace).replaceAll(/[^a-zA-Z0-9_-]/g, '_'));
        // A word repeated where two fragments meet is written once. RemoveAll counts each word as a fragment
        let sentence = repeatedWords !== RepeatedWords_1.RepeatedWords.Keep
            ? (repeatedWords === RepeatedWords_1.RepeatedWords.RemoveAll
                ? cleanFragments.flatMap((fragment) => (0, change_case_1.kebabCase)(fragment).split('-'))
                : cleanFragments)
                .reduce((words, fragment) => {
                const fragmentWords = (0, change_case_1.kebabCase)(fragment).split('-').filter((word) => word.length > 0);
                return [...words, ...(fragmentWords[0] === words[words.length - 1] ? fragmentWords.slice(1) : fragmentWords)];
            }, [])
                .join(' ')
            : cleanFragments.join('_');
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
