"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepeatedWords = void 0;
/**
 * Which repeated words a name keeps when it is built from fragments, such as a prefix, a group path and a token name.
 * The values are the option keys of the exporters' "Repeated words" setting, so saved pipelines store them: renaming one breaks those pipelines
 */
var RepeatedWords;
(function (RepeatedWords) {
    /** "color", "color", "bg" → "color-color-bg". A token name that starts with its group's name keeps that word too ("Neutral" + "Neutral 500" → neutral-neutral-500) */
    RepeatedWords["Keep"] = "keep";
    /** A word repeated where two fragments meet is written once; a word repeated inside one fragment is kept */
    RepeatedWords["RemoveWhereFragmentsMeet"] = "removeWhereFragmentsMeet";
    /** Any word equal to the word before it is written once */
    RepeatedWords["RemoveAll"] = "removeAll";
})(RepeatedWords || (exports.RepeatedWords = RepeatedWords = {}));
