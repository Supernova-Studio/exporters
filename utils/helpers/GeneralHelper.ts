
export class GeneralHelper {
  /**
   * Creates an indentation string based on the number of levels and type
   * @param spaces - Number of spaces per level (default: 2)
   * @returns Indentation string
   */
  static indent(spaces: number = 2): string {
    return ' '.repeat(Math.max(0, spaces));
  }
} 