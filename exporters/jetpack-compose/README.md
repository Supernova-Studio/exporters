![Jetpack Compose Exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/jetpack-compose/resources/header.png)

# Jetpack Compose Exporter

The Jetpack Compose Exporter is a powerful package for converting your design system data into a production-ready Jetpack Compose configuration. It facilitates a seamless transition from design to development, ensuring consistency and accuracy throughout the process. The Jetpack Compose exporter has a variety of configuration options to make sure the configuration always fits your codebase.

## Exporter Features

This exporter package converts your design system tokens into Kotlin objects that can be consumed by your Android applications. Here are its key features:

- **Support for all Supernova token types:** Generates Kotlin properties from all token types, including colors, typography, dimensions and more.
- **Branding support:** Can generate code for different brands you've defined in Supernova.
- **Theming support:** Can generate code for different themes you've defined in Supernova.
- **Customizable package names and file structure:** Configure how files are organized and which package they belong to.
- **Use token references:** Optionally resolve or preserve references between tokens.
- **Index object generation:** Create a Kotlin object that exposes all token files for easy access.
- **Automatic write-back:** Optionally write generated property names back to tokens as custom properties.

## Example of Output

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
    value: "#0000ff"
}, {
    type: "color",
    name: "primary",
    value: "{red}",
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
    "indent": 4,
    "packageNamePrefix": "com.company.app.tokens"
}
```

The exporter would produce:

```kotlin
/**
* This file was automatically generated. Do not modify manually.
*/

package com.company.app.tokens

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

@Immutable
object ColorTokens {
    /** The reddest of reds */
    val colorRed = Color(0xFFFF0000)
    val colorBlue = Color(0xFF0000FF)
    /** The main color used throughout the application. */
    val colorPrimary = colorRed
}
```

## Configuration Options

Here is a list of all the configuration options this exporter provides:

### Packages
- **packageNamePrefix:** Base package name used for all generated files.
- **rPackageName:** Package name used for resource (R) imports. Leave empty to reuse the package name prefix.

### Token values
- **useReferences:** Values will use references to other tokens where applicable.

### Themes
- **exportOnlyThemedTokens:** Theme files will only include tokens that have different values from the base value.
- **exportBaseValues:** Base token values will be exported along with themes.

### Index
- **generateIndexFile:** Generate a Kotlin object that references all token files.
- **indexFileName:** File name of the generated index object.

### Files
- **fileStructure:** Choose how generated token files are organized (`separateByType` or `singleFile`).
- **singleFileName:** Name for the base Kotlin file and object containing all tokens when using single file mode.
- **nonThemedFilePath:** Directory for files without applied themes, relative to the export root.
- **customizeSeparatedByTypeFileNames:** Enable to override default file names for each token type.
- **separatedByTypeFileNames:** Specify file name for each token type (requires customizeSeparatedByTypeFileNames).
- **generateEmptyFiles:** Create empty token files instead of skipping them.

### Token names
- **globalNamePrefix:** Prefix added to every generated property name.
- **customizeTokenPrefixes:** Customize the prefixes for each design token type.
- **tokenPrefixes:** Each token of a specific type is prefixed with the following identifier (requires customizeTokenPrefixes).

### Other
- **showDescriptions:** Show the token description as a code comment for every exported token.
- **showGeneratedFileDisclaimer:** A message explaining that the file was automatically generated will appear in all token files.
- **disclaimer:** Text of the generated file disclaimer (requires showGeneratedFileDisclaimer).
- **indent:** Number of spaces used in generated Kotlin files.

### Automatic write-back
- **writeNameToProperty:** Save generated variable names back to tokens as custom properties.
- **propertyToWriteNameTo:** Name of the custom property where generated variable names will be saved (requires writeNameToProperty).
