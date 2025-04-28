"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringCase = void 0;
/**
 * Enum representing different string case formats used for naming tokens and variables
 * Examples are shown for the input: "hello world example 123"
 */
var StringCase;
(function (StringCase) {
    /** Example: "helloWorldExample123" */
    StringCase["camelCase"] = "camelCase";
    /** Example: "Hello World Example 123" */
    StringCase["capitalCase"] = "capitalCase";
    /** Example: "HELLO_WORLD_EXAMPLE_123" */
    StringCase["constantCase"] = "constantCase";
    /** Example: "hello.world.example.123" */
    StringCase["dotCase"] = "dotCase";
    /** Example: "Hello-World-Example-123" */
    StringCase["trainCase"] = "trainCase";
    /** Example: "hello world example 123" */
    StringCase["noCase"] = "noCase";
    /** Example: "hello-world-example-123" */
    StringCase["kebabCase"] = "kebabCase";
    /** Example: "HelloWorldExample123" */
    StringCase["pascalCase"] = "pascalCase";
    /** Example: "hello/world/example/123" */
    StringCase["pathCase"] = "pathCase";
    /** Example: "Hello world example 123" */
    StringCase["sentenceCase"] = "sentenceCase";
    /** Example: "hello_world_example_123" */
    StringCase["snakeCase"] = "snakeCase";
    /** Example: "helloworldexample123" */
    StringCase["flatCase"] = "flatCase";
})(StringCase || (exports.StringCase = StringCase = {}));
