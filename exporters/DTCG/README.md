![DTCG / Style Dictionary Exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/css/resources/header.png)

# DTCG / Style Dictionary Exporter

The DTCG / Style Dictionary Exporter is a powerful package for converting your design system data into DTCG / Style Dictionary-ready definitions. It facilitates a seamless transition from design to development, ensuring consistency and accuracy throughout the process. The DTCG exporter has a variety of configuration options to make sure the resulting definition files always fit the needs of your tooling.

## Exporter Features

This exporter package takes your design system tokens and converts them to CSS in various ways. Here are its key features:

- **Support for all Supernova token types:** Generates DTCG definitions from all token types, including colors, text styles, shadows, dimensions and more.
- **Branding support:** Generates DTCG definitions for different brands you've created or imported into Supernova.
- **Theming support:** Generates DTCG definitions for different themes you've created or imported into Supernova.
- **Customizable output:** Can be configured to generate definitions in variety of ways.
- **Customizable formatting:** Can be configured to generate each token using various formatting, like hex, rgb, camelCase and so on.
- **Comment support:** Can include descriptions for each token as code comments, if provided. Can also provide a disclaimer at the top of each file to prevent people from tinkering with the generated code manually.
- **File organization:** Can generate output in various ways, such as separate files for each token type, or a single file with all tokens.

## Example of Output

Given the following design system token (meta representation for brevity):

```json
TODO
```

With configurations:

```json
TODO
```

The exporter would produce:

```json
TODO
```

## Configuration Options

Here is a list of all the configuration options this exporter provides:

TODO
