All the updates to this exporter are documented in this file.

### ATT React Native POC (based on CSS in JS Exporter) Release Notes

## 2.2.0 - 2026-01-16

### 🚀 New

- **Shadow token conversion:**
  - Convert CSS `box-shadow` strings to React Native ViewStyle objects
  - Automatically parse shadow properties (offset, blur, spread, color with alpha)
  - Generate React Native-compatible shadow objects with `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation`
  - Example: `'0px 16px 24px 0px #00000014'` → React Native ViewStyle object

  - **Gradient token conversion:**
  - Convert CSS `linear-gradient()` strings to React Native gradient objects
  - Automatically parse gradient properties (angle, color stops, locations)
  - Support standard angles (0°, 90°, 180°, 270°) and custom angles using trigonometry
  - Convert rgba colors to hex format
  - Generate React Native-compatible gradient objects with `colors`, `locations`, `start`, and `end` properties
  - Example: `linear-gradient(90deg, #0079b1 0%, #00c9ff 100%)` → React Native gradient object
  - Note: Gradients with token references are preserved as CSS strings (references cannot be resolved during parsing)


### 🔧 Modified

- **Font weight token mapping:**
  - Implement scalable mapping system for named fontWeight values
  - Preserve `'bold'` as `'bold'` instead of converting to `'700'`
  - Mapping can be extended in `src/files/style-file.ts` by adding entries to `fontWeightMap` object

## 2.1.8 - 2026-01-15

### 🔧 Modified

- **Numeric token conversions for React Native compatibility:**
  - Blur tokens: Extract numeric values from `blur()` functions (e.g., `blur(8px)` → `8`)
  - Border radius tokens: Convert `px` strings to numbers (e.g., `'8px'` → `8`)
  - Border width tokens: Convert `px` strings to numbers (e.g., `'1px'` → `1`)
  - Duration tokens: Convert `ms` strings to numbers (e.g., `'100ms'` → `100`)
  - Font size tokens: Convert `px` strings to numbers (e.g., `'16px'` → `16`)
  - Opacity tokens: Convert string values to numbers, handling quoted values (e.g., `'0.4'` → `0.4`)
  - Space tokens: Convert `px` strings to numbers (e.g., `'8px'` → `8`)
- **Font family token formatting:**
  - Remove surrounding double quotes from font family values (e.g., `'"ATTAleckSans-Bold"'` → `'ATTAleckSans-Bold'`)

---------------- // ---------------------- // ---------------------------------------

### CSS in JS Exporter Release Notes

## 2.1.0 - 2025-03-12

### 🚀 New

Added automatic write-back functionality that allows saving generated variable names back to tokens:
- New option to enable/disable automatic write-back of generated names
- Configurable custom property name where the generated names will be saved
- Helps maintain consistency between design tokens and generated code

## 2.0.0 - 2025-02-10

### 🚀 New

This is the initial release of the CSS in JS Exporter. The exporter is built on the new export engine and is part of the Pulsar 2.0 release.

The CSS in JS exporter comes with extensive configuration options that allow you to customize the output format. Before modifying the code itself, check the configuration options - it's likely you can achieve your desired output through configuration alone.

The generated output is compatible with popular CSS-in-JS libraries like Emotion and Styled Components, allowing seamless integration into your applications.

Key features include:
- Support for all token types (colors, typography, spacing, etc.)
- Multiple color format options (HEX, RGB, HSL, OKLCH)
- Various token naming conventions (camelCase, constantCase, etc.)
- Flexible theming and branding support
- Customizable file organization