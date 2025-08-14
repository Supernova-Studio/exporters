import { Supernova } from '@supernovaio/sdk-exporters';
/** A utility class to help with network operations */
export declare class NetworkHelper {
    /**
     * Perform fetch and parse response as plain text.
     *
     * @param url The URL to fetch the text data from.
     * @param options Optional configurations for the fetch request.
     * @returns A promise that resolves with the response processed as text.
     */
    static fetchAsText(sdk: Supernova, url: string, options?: RequestInit): Promise<string>;
    /**
     * Perform fetch and parse response as JSON.
     *
     * @param url The URL to fetch the JSON data from.
     * @param options Optional configurations for the fetch request.
     * @returns A promise that resolves with the response processed as text.
     */
    static fetchAsJSON<T>(sdk: Supernova, url: string, options?: RequestInit): Promise<T>;
    /**
     * Perform fetch and parse response as plain text.
     *
     * @param url The URL to fetch the text data from.
     * @param options Optional configurations for the fetch request.
     * @returns A promise that resolves with the response processed as text.
     */
    static fetchAsData(sdk: Supernova, url: string, options?: RequestInit): Promise<ArrayBuffer>;
    /** Perform generic fetch */
    private static performFetch;
}
