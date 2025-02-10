"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenNameTracker = void 0;
const NamingHelper_1 = require("./NamingHelper");
class TokenNameTracker {
    constructor() {
        this.tokenNameMap = new Map(); // token.id -> generated name
        this.nameToTokenMap = new Map(); // generated name -> token.id
    }
    reset() {
        this.tokenNameMap.clear();
        this.nameToTokenMap.clear();
    }
    getTokenName(token, tokenGroups, format, prefix, forExport = false) {
        // If we're looking up a name for reference and it was already generated, use that
        if (!forExport && this.tokenNameMap.has(token.id)) {
            return this.tokenNameMap.get(token.id);
        }
        const parent = tokenGroups.find((group) => group.id === token.parentGroupId);
        // Get the base name
        let name = NamingHelper_1.NamingHelper.codeSafeVariableNameForToken(token, format, parent, prefix);
        let counter = 1;
        // If name is taken by a different token, add a suffix
        while (this.nameToTokenMap.has(name) && this.nameToTokenMap.get(name) !== token.id) {
            name = `${name}${counter++}`;
        }
        // Track the name
        if (!forExport) {
            this.tokenNameMap.set(token.id, name);
            this.nameToTokenMap.set(name, token.id);
        }
        return name;
    }
}
exports.TokenNameTracker = TokenNameTracker;
