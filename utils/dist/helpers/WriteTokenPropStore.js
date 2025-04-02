"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteTokenPropStore = void 0;
const NamingHelper_1 = require("./NamingHelper");
const StringCase_1 = require("../enums/StringCase");
/**
 * Class responsible for storing and updating token properties in Supernova.
 */
class WriteTokenPropStore {
    /**
     * Initializes the store with necessary dependencies.
     * @param sdk - The Supernova SDK instance.
     * @param target - The remote version identifier to write to.
     */
    constructor(sdk, target) {
        /**
         * Stores token property values to be written.
         * Outer Map: property name -> Inner Map: token -> value.
         */
        this.tokenPropertyWriteMap = new Map();
        this.sdk = sdk;
        this.target = target;
    }
    /**
     * Stores a value for a specific token and property name to be written later.
     * @param token - The token to associate the value with.
     * @param propertyName - The name of the property.
     * @param value - The value to store.
     */
    storeValueForTokenProperty(token, propertyName, value) {
        // Get or initialize the map for this property name
        let tokenMap = this.tokenPropertyWriteMap.get(propertyName);
        if (!tokenMap) {
            tokenMap = new Map();
            this.tokenPropertyWriteMap.set(propertyName, tokenMap);
        }
        // Associate the value with the token
        tokenMap.set(token, value);
    }
    /**
     * Updates all stored token properties in the external system.
     * Fetches existing properties once and creates missing ones efficiently.
     */
    async batchUpdateStoredTokenProperties() {
        // Exit early if there are no properties to update
        if (this.tokenPropertyWriteMap.size === 0) {
            return;
        }
        // Fetch all existing properties once and map them by name for quick lookup
        let properties = await this.sdk.tokens.getTokenProperties(this.target);
        // Process each property and its associated token-value pairs
        for (const [propertyName, tokenMap] of this.tokenPropertyWriteMap) {
            let property = properties.find((prop) => prop.name === propertyName);
            // Create the property if it doesn’t exist
            if (!property) {
                void (await this.sdk.tokens.createTokenProperty(this.target, {
                    type: "Generic", // Using "Generic" (a.k.a. formatted "Code" in Supernova UI) instead of a pure "Text" property
                    name: propertyName,
                    codeName: NamingHelper_1.NamingHelper.codeSafeVariableName([propertyName], StringCase_1.StringCase.camelCase),
                    columnWidth: 200,
                    description: "Variable name to use in code",
                }));
                properties = await this.sdk.tokens.getTokenProperties(this.target);
                property = properties.find((prop) => prop.name === propertyName);
            }
            if (!property) {
                throw new Error(`Failed to retrieve or create property ${propertyName}.`);
            }
            // Update each token’s property value
            const payload = Array.from(tokenMap).map(([token, valueToWrite]) => ({
                definitionId: property.id,
                targetElementId: token.id,
                value: valueToWrite,
            }));
            await this.sdk.bulkOperations.updateElementProperties(this.target, payload);
        }
    }
    /**
     * Writes token properties to the specified property name using the provided value generator.
     * @param propertyName - The name of the property to write to.
     * @param tokens - The list of tokens to update.
     * @param valueGenerator - A function that generates the property value (usually name) for each token.
     */
    async writeTokenProperties(propertyName, tokens, valueGenerator) {
        const trimmedPropertyName = propertyName?.trim();
        if (!trimmedPropertyName) {
            return;
        }
        for (const token of tokens) {
            const value = valueGenerator(token);
            this.storeValueForTokenProperty(token, trimmedPropertyName, value);
        }
        await this.batchUpdateStoredTokenProperties();
    }
}
exports.WriteTokenPropStore = WriteTokenPropStore;
