"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorFormat = void 0;
var ColorFormat;
(function (ColorFormat) {
    /** Example: rgb(255, 0, 0) */
    ColorFormat["rgb"] = "rgb";
    /** Example: rgba(255, 0, 0, 1) */
    ColorFormat["rgba"] = "rgba";
    /** Automatically choose between rgb() and rgba() */
    ColorFormat["smartRgba"] = "smartRgba";
    /** HEX - ffffff */
    ColorFormat["hex6"] = "hex6";
    /** HEXA - ffffff00 */
    ColorFormat["hex8"] = "hex8";
    /** Android/Compose ARGB int – e.g. Color(0x00FFFFFF) */
    ColorFormat["argbInt"] = "argbInt";
    /** Example: #ff0000 */
    ColorFormat["hashHex6"] = "hashHex6";
    /** Example: #ff0000ff */
    ColorFormat["hashHex8"] = "hashHex8";
    /** Automatically choose between #RRGGBB and #RRGGBBAA */
    ColorFormat["smartHashHex"] = "smartHashHex";
    /** Selects between hex and hexa modes based on non-opaque alpha */
    ColorFormat["smartHex"] = "smartHex";
    /** Example: hsl(0, 100%, 50%) */
    ColorFormat["hsl"] = "hsl";
    /** Example: hsla(0, 100%, 50%, 1) */
    ColorFormat["hsla"] = "hsla";
    /** Automatically choose between hsl() and hsla() */
    ColorFormat["smartHsla"] = "smartHsla";
    /** iOS UIColor created as UIColor(rgb: 0x000000).withAlphaComponent(0.5). Alpha component will be ommited if fully opaque */
    ColorFormat["smartUIColor"] = "smartUIColor";
    /** Example: oklch(0.6 0.15 30) */
    ColorFormat["oklch"] = "oklch";
    /** Example: oklch(0.6 0.15 30 / 1) */
    ColorFormat["oklcha"] = "oklcha";
    /** Automatically choose between oklch() and oklch() with alpha */
    ColorFormat["smartOklch"] = "smartOklch";
})(ColorFormat || (exports.ColorFormat = ColorFormat = {}));
