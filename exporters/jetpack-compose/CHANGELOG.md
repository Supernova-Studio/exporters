### Jetpack Compose exporter release notes
All the updates to this exporter are documented in this file.

## 1.0.1 - 2026-11-23

### 🐞 Fixed
- Shadows keep their own opacity when their color references a color token: a shadow on Gray 900 at 20% now exports as `ColorTokens.colorGray900.copy(alpha = 0.2f)`. It was exported as the solid color.
- Colors that reference another color with their own opacity, shown in Supernova as "Brand / 40%", now export as `colorBrand.copy(alpha = 0.4f)`, so they follow the source color. They were a fixed `Color(0x66…)`. With references off they are written as the resolved color.
- A token is always declared below the token it references, so a reference to an alias no longer stops the generated file from compiling.

## 1.0.0 - 2026-11-23

### 🚀 New
- The Jetpack Compose exporter is out of beta.

### 🐞 Fixed
- A word repeated inside one token or group name now stays in the property name instead of being written once, which could add a `Copy1` suffix.

## 0.0.1 - 2025-06-06

### 🚀 New
- Initial beta release of the Jetpack Compose exporter. We are actively looking for feedback to improve it further.
