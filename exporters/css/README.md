![CSS exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/css/resources/header.png)

# CSS exporter

The CSS exporter is a powerful package for converting your design system data into production-ready CSS. It facilitates a seamless transition from design to development, ensuring consistency and accuracy throughout the process. The CSS exporter has a variety of configuration options to make sure the CSS always fits your codebase.

## Exporter features

This exporter package takes your design system tokens and converts them to CSS in various ways. Here are its key features:

- **Support for all Supernova token types:** Generates CSS from all token types, including colors, text styles, shadows, dimensions and more.
- **Branding support:** Can generate CSS for different brands you've defined in Supernova.
- **Theming support:** Can generate CSS for different themes you've defined in Supernova.
- **Customizable output:** Can be configured to generate CSS in variety of ways.
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
    "showGeneratedFileDisclaimer": true,
    "disclaimer": "This file was automatically generated. Do not modify manually.",
    "showDescriptions": true,
    "useReferences": true,
    "tokenNameStyle": "kebabCase",
    "colorFormat": "hex",
    "indent": 2
}
```

The exporter would produce:

```css
/* This file was automatically generated. Do not modify manually. */

:root {
  /* The reddest of reds */
  --color-red: #ff0000;
  --color-blue: #0000ff;
  /* The main color used throughout the application. */
  --color-primary: var(--color-red);
}
```

With `useFallbackValues: true`, the output would include fallback values:

```css
/* This file was automatically generated. Do not modify manually. */

:root {
  /* The reddest of reds */
  --color-red: #ff0000;
  --color-blue: #0000ff;
  /* The main color used throughout the application. */
  --color-primary: var(--color-red, #ff0000);
}
```

## Configuration options

Here is a list of all the configuration options this exporter provides:

### Token names

- **tokenNameStyle:** Define the naming convention of the exported tokens:
  - `camelCase`: Example: --myVariableName
  - `constantCase`: Example: --MY_VARIABLE_NAME
  - `flatCase`: Example: --myvariablename
  - `kebabCase` (default): Example: --my-variable-name
  - `pascalCase`: Example: --MyVariableName
  - `snakeCase`: Example: --my_variable_name
  - `trainCase`: Example: --My-Variable-Name

- **tokenNameStructure:** Control what parts are included in the exported token names:
  - `pathAndName` (default): Include path and name (e.g. button-primary-background)
  - `nameOnly`: Only include name (e.g. background)
  - `collectionPathAndName`: Include collection, path, and name (e.g. core-button-primary-background)

- **globalNamePrefix:** Prefix all variable names (e.g., '--ds-color-primary').

- **customizeTokenPrefixes:** Customize the prefixes for each design token type.

- **tokenPrefixes:** Each token of a specific type is prefixed with the following identifier (requires customizeTokenPrefixes: true).

### Token values

- **colorFormat:** Export color token values in the selected color format:
  - `smartHashHex` (default): Automatically choose between #RRGGBB and #RRGGBBAA
  - `smartRgba`: Automatically choose between rgb() and rgba()
  - `smartHsla`: Automatically choose between hsl() and hsla()
  - `smartOklch`: Automatically choose between oklch() and oklch() with alpha
  - And more specific formats like `hashHex6`, `hashHex8`, `rgb`, `rgba`, `hsl`, `hsla`, `oklch`, `oklcha`

- **forceRemUnit:** Convert all pixel values to REM units.

- **remBase:** Base pixel value for REM conversion (default: 16, requires forceRemUnit: true).

- **useReferences:** Values will use references to other tokens where applicable.

- **useFallbackValues:** When enabled, references will include fallback values as raw token values to handle cases when referenced variables are not loaded in the browser.

- **colorPrecision:** Maximum number of decimals in colors.

### Themes

- **exportThemesAs:** Control how themes are exported in the CSS files:
  - `separateFiles`: Generate a separate CSS file for each selected theme
  - `applyDirectly`: Apply selected themes directly to token values
  - `mergedTheme`: Generate theme variables with all themes applied together

- **exportOnlyThemedTokens:** Theme files will only include tokens that have different values from the base value.

- **exportBaseValues:** Base token values will be exported along with themes.

### Style files

- **fileStructure:** Control how token styles are organized in files:
  - `separateByType` (default): Generate separate files for each token type
  - `singleFile`: Generate one combined file containing all token types

- **generateEmptyFiles:** Generate empty style files instead of omitting them.

- **baseStyleFilePath:** All files will be written to this directory relative to export root.

- **customizeStyleFileNames:** Customize the file names for each token type.

- **styleFileNames:** Name of each file that will be generated, grouped by token type (requires customizeStyleFileNames: true).

### Index file

- **generateIndexFile:** Generate a file with imports for all base and theme style files.

- **indexFileName:** The name of the index file that will be generated.

- **baseIndexFilePath:** Index file will be written to this directory relative to export root.

### CSS selectors

- **cssSelector:** CSS selector for base token variables (e.g. ':root' for global scope).

- **themeSelector:** CSS selector for theme files. Use {theme} placeholder to insert theme name.

### Other

- **showDescriptions:** Show the token description as a code comment for every exported token.

- **showGeneratedFileDisclaimer:** A message explaining that the file was automatically generated will appear in all style files.

- **disclaimer:** A message explaining that the file was automatically generated will appear in all style files (requires showGeneratedFileDisclaimer: true).

- **indent:** Number of spaces used to indent CSS variables.

### Automatic write-back

- **writeNameToProperty:** Enable saving generated variable names back to tokens as custom properties.
- **propertyToWriteNameTo:** Name of the custom property where generated variable names will be saved.
- **propertyToWriteNameToIncludesVar:** If enabled, the resulting written properties will be encapsulated in var() syntax for easier copying.
