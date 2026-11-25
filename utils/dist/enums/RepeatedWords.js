"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepeatedWords = void 0;
exports.repeatedWordsFromSetting = repeatedWordsFromSetting;
/** Which repeated words a name keeps when it is built from fragments, such as a prefix, a group path and a token name */
var RepeatedWords;
(function (RepeatedWords) {
    /** "color", "color", "bg" → "color-color-bg" */
    RepeatedWords["Keep"] = "keep";
    /** A word repeated where two fragments meet is written once; a word repeated inside one fragment is kept */
    RepeatedWords["RemoveWhereFragmentsMeet"] = "removeWhereFragmentsMeet";
    /** Any word equal to the word before it is written once */
    RepeatedWords["RemoveAll"] = "removeAll";
})(RepeatedWords || (exports.RepeatedWords = RepeatedWords = {}));
/** Maps an exporter's "Remove repeated words" setting to the mode for token names */
function repeatedWordsFromSetting(removeRepeatedWords) {
    return removeRepeatedWords ? RepeatedWords.RemoveAll : RepeatedWords.RemoveWhereFragmentsMeet;
}
