"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkHelper = void 0;
/** A utility class to help with network operations */
class NetworkHelper {
    /**
     * Perform fetch and parse response as plain text.
     *
     * @param url The URL to fetch the text data from.
     * @param options Optional configurations for the fetch request.
     * @returns A promise that resolves with the response processed as text.
     */
    static async fetchAsText(sdk, url, options) {
        const response = await this.performFetch(sdk, url, options);
        return response.text();
    }
    /**
     * Perform fetch and parse response as JSON.
     *
     * @param url The URL to fetch the JSON data from.
     * @param options Optional configurations for the fetch request.
     * @returns A promise that resolves with the response processed as text.
     */
    static async fetchAsJSON(sdk, url, options) {
        const response = await this.performFetch(sdk, url, options);
        return response.json();
    }
    /**
     * Perform fetch and parse response as plain text.
     *
     * @param url The URL to fetch the text data from.
     * @param options Optional configurations for the fetch request.
     * @returns A promise that resolves with the response processed as text.
     */
    static async fetchAsData(sdk, url, options) {
        const response = await this.performFetch(sdk, url, options);
        return response.arrayBuffer();
    }
    /** Perform generic fetch */
    static async performFetch(sdk, url, options) {
        try {
            const response = await sdk.network.fetch(url, options);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}, error: ${await response.text()}`);
            }
            return response;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.NetworkHelper = NetworkHelper;
