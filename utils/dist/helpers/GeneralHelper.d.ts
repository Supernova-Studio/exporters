export declare class GeneralHelper {
    /**
     * Creates an indentation string based on the number of levels and type
     * @param spaces - Number of spaces per level (default: 2)
     * @returns Indentation string
     */
    static indent(spaces?: number): string;
    /**
     * Formats a disclaimer text into a JSDoc comment block
     * @param disclaimer - The disclaimer text to format
     * @param content - The content to append after the disclaimer
     * @returns Formatted string with disclaimer comment and content
     */
    static addDisclaimer(disclaimer: string, content: string): string;
}
