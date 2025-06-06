export enum ColorFormat {
    /** Example: rgb(255, 0, 0) */
    rgb = 'rgb',
    /** Example: rgba(255, 0, 0, 1) */
    rgba = 'rgba',
    /** Automatically choose between rgb() and rgba() */
    smartRgba = 'smartRgba',
    /** HEX - ffffff */
    hex6 = 'hex6',
    /** HEXA - ffffff00 */
    hex8 = 'hex8',
    /** Android/Compose ARGB int – e.g. Color(0x00FFFFFF) */
    argbInt = 'argbInt',
    /** Example: #ff0000 */
    hashHex6 = 'hashHex6',
    /** Example: #ff0000ff */
    hashHex8 = 'hashHex8',
    /** Automatically choose between #RRGGBB and #RRGGBBAA */
    smartHashHex = 'smartHashHex',
    /** Selects between hex and hexa modes based on non-opaque alpha */
    smartHex = 'smartHex',
    /** Example: hsl(0, 100%, 50%) */
    hsl = 'hsl',
    /** Example: hsla(0, 100%, 50%, 1) */
    hsla = 'hsla',
    /** Automatically choose between hsl() and hsla() */
    smartHsla = 'smartHsla',
    /** iOS UIColor created as UIColor(rgb: 0x000000).withAlphaComponent(0.5). Alpha component will be ommited if fully opaque */
    smartUIColor = 'smartUIColor',
    /** Example: oklch(0.6 0.15 30) */
    oklch = 'oklch',
    /** Example: oklch(0.6 0.15 30 / 1) */
    oklcha = 'oklcha',
    /** Automatically choose between oklch() and oklch() with alpha */
    smartOklch = 'smartOklch'
}