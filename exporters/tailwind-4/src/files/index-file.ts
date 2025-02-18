import { OutputTextFile } from "@supernovaio/sdk-exporters"

/**
 * Index file generation is disabled as we're using a single Tailwind CSS file
 * 
 * @param tokens - Optional tokens array (not used in this implementation)
 * @param themes - Optional themes array (not used in this implementation)
 */
export function indexOutputFile(_tokens?: any, _themes?: any): OutputTextFile | null {
    return null
}
