![CSS in JS Exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/css-in-js/resources/header.png)

# CSS in JS Exporter

The CSS in JS Exporter is a powerful package for converting your design system data into production-ready CSS in JS. It facilitates a seamless transition from design to development, ensuring consistency and accuracy throughout the process. The CSS in JS exporter has a variety of configuration options to make sure the CSS always fits your codebase.

## Exporter features

This exporter package takes your design system tokens and converts them to CSS in JS in various ways. Here are its key features:

- **Support for all Supernova token types:** Generates TypeScript/JavaScript objects from all token types, including colors, text styles, shadows, dimensions and more.
- **Branding support:** Can generate code for different brands you've defined in Supernova.
- **Theming support:** Can generate code for different themes you've defined in Supernova.
- **Customizable output:** Can be configured to generate TypeScript/JavaScript in variety of ways.
- **Customizable formatting:** Can be configured to generate each token using various formatting, like hex, rgb, camelCase and so on.
- **Comment support:** Can include descriptions for each token as code comments, if provided. Can also provide a disclaimer at the top of each file to prevent people from tinkering with the generated code manually.
- **File organization:** Can generate output in various ways, such as separate files for each token type, or a single file with all tokens.

## Example of output

Given the following design system token (meta representation for brevity):

```typescript
const tokens = [{
    type: "color",
    name: "red",
    value: "#ff0000",
    description: "The reddest of reds"
}, {
    type: "color",
    name: "blue",
    value: "#0000ff",
}, {
    type: "color",
    name: "primary",
    value: "{primary}",
    description: "The main color used throughout the application"
}];
```

With configurations:

```json
{
    "showDescriptions": true,
    "useReferences": true,
    "tokenNameStyle": "constantCase",
    "colorFormat": "hex",
    "indent": 2
}
```

The exporter would produce:

```typescript
/*
* This file was generated automatically by Supernova.io and should not be changed manually.
* To modify the format or content of this file, please contact your design system team.
*/

export const theme = {
  /* The reddest of reds */
  COLOR_RED: "#ff0000",
  COLOR_BLUE: "#0000ff",
  /* The main color used throughout the application. */
  COLOR_PRIMARY: COLOR_RED,
}
```

## Configuration options

Here is a list of all the configuration options this exporter provides:

### Token names
- **globalNamePrefix:** Prefix all token names (e.g., 'ds_color_primary').
- **customizeTokenPrefixes:** Customize the prefixes for each design token type.
- **tokenPrefixes:** Define specific prefixes for each token type (when customizeTokenPrefixes is enabled).
- **tokenNameStyle:** Define the naming convention of the exported tokens (camelCase, constantCase, flatCase, pascalCase, or snakeCase).

### Token values
- **colorFormat:** Set the format for color exports (HEX, RGB, HSL, OKLCH with various options).
- **forceRemUnit:** Convert all pixel values to REM units.
- **remBase:** Base pixel value for REM conversion (when forceRemUnit is enabled).
- **useReferences:** Use references to other tokens instead of direct values where possible.
- **colorPrecision:** Maximum number of decimals in colors.

### Themes
- **exportThemesAs:** Control how themes are exported (separate files, applied directly, or merged).
- **exportOnlyThemedTokens:** Only include tokens that differ from base values in theme files.
- **exportBaseValues:** Include base token values along with themes.

### Index file
- **generateIndexFile:** Generate a file with imports for all base and theme files.
- **indexFileName:** Name of the generated index file.
- **baseIndexFilePath:** Directory path for the index file relative to export root.

### Style files
- **generateEmptyFiles:** Generate empty files instead of omitting them.
- **baseStyleFilePath:** Directory path for files relative to export root.
- **customizeStyleFileNames:** Enable custom file names for each token type.
- **styleFileNames:** Define specific file names for each token type (when customizeStyleFileNames is enabled).
- **tokenSortOrder:** Control how token names are sorted in generated files (default order or alphabetical).

### Other
- **showDescriptions:** Display descriptions for each token as code comments.
- **showGeneratedFileDisclaimer:** Show a disclaimer indicating the file is auto-generated.
- **disclaimer:** Set the text of the auto-generation disclaimer.
- **indent:** Number of spaces used for indentation.

### Automatic write-back
- **writeNameToProperty:** Enable saving generated variable names back to tokens as custom properties.
- **propertyToWriteNameTo:** Name of the custom property where generated variable names will be saved.

## Possible future improvements

Here are some planned improvements for future versions:

- **CSS Variables Export**: Generate CSS custom properties alongside JS tokens for hybrid approaches and runtime theme switching

- **Object Token Format**: Export tokens in a structured object format instead of flat values:
  ```typescript
  export const tokens = {
    colors: { primary: '#...', secondary: '#...' },
    spacing: { small: '4px', large: '8px' }
  }
  ```
