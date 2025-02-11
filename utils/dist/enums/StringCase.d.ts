/**
 * Enum representing different string case formats used for naming tokens and variables
 * Examples are shown for the input: "hello world example 123"
 */
export declare enum StringCase {
    /** Example: "helloWorldExample123" */
    camelCase = "camelCase",
    /** Example: "Hello World Example 123" */
    capitalCase = "capitalCase",
    /** Example: "HELLO_WORLD_EXAMPLE_123" */
    constantCase = "constantCase",
    /** Example: "hello.world.example.123" */
    dotCase = "dotCase",
    /** Example: "Hello-World-Example-123" */
    trainCase = "trainCase",
    /** Example: "hello world example 123" */
    noCase = "noCase",
    /** Example: "hello-world-example-123" */
    kebabCase = "kebabCase",
    /** Example: "HelloWorldExample123" */
    pascalCase = "pascalCase",
    /** Example: "hello/world/example/123" */
    pathCase = "pathCase",
    /** Example: "Hello world example 123" */
    sentenceCase = "sentenceCase",
    /** Example: "hello_world_example_123" */
    snakeCase = "snakeCase",
    /** Example: "helloworldexample123" */
    flatCase = "flatCase"
}
