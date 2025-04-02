import { RemoteVersionIdentifier, Supernova, Token } from "@supernovaio/sdk-exporters";
/**
 * Class responsible for storing and updating token properties in Supernova.
 */
export declare class WriteTokenPropStore {
    /**
     * Stores token property values to be written.
     * Outer Map: property name -> Inner Map: token -> value.
     */
    private tokenPropertyWriteMap;
    /** Supernova SDK instance for interacting with the external system. */
    private sdk;
    /** Target version identifier for the operations. */
    private target;
    /**
     * Initializes the store with necessary dependencies.
     * @param sdk - The Supernova SDK instance.
     * @param target - The remote version identifier to write to.
     */
    constructor(sdk: Supernova, target: RemoteVersionIdentifier);
    /**
     * Stores a value for a specific token and property name to be written later.
     * @param token - The token to associate the value with.
     * @param propertyName - The name of the property.
     * @param value - The value to store.
     */
    storeValueForTokenProperty(token: Token, propertyName: string, value: string): void;
    /**
     * Updates all stored token properties in the external system.
     * Fetches existing properties once and creates missing ones efficiently.
     */
    batchUpdateStoredTokenProperties(): Promise<void>;
    /**
     * Writes token properties to the specified property name using the provided value generator.
     * @param propertyName - The name of the property to write to.
     * @param tokens - The list of tokens to update.
     * @param valueGenerator - A function that generates the property value (usually name) for each token.
     */
    writeTokenProperties(propertyName: string, tokens: Token[], valueGenerator: (token: Token) => string): Promise<void>;
}
