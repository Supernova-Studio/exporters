### Jetpack Compose exporter release notes
All the updates to this exporter are documented in this file.

## 1.1.0 - 2026-11-25

### 🚀 New
- New "Repeated words" setting in Token names. "Remove all" (default) writes a word repeated inside one token or group name once again, as before 1.0.0: "Super super token" exports as `colorSuperToken`. "Remove where names meet" keeps the 1.0.0 names. If two tokens now share a name, for example "Fast-fast themed ref" and "Fast themed ref" → `durationFastThemedRef` and `durationFastThemedRefCopy1`, pick "Remove where names meet" or "Keep all". "Keep all" also keeps a word repeated where a group meets the token name or the token type prefix meets a group: "Neutral 500" in the "Neutral" group exports as `colorNeutralNeutral500`.

## 1.0.1 - 2026-11-23

### 🐞 Fixed
- Shadows keep their own opacity when their color references a color token: a shadow on Gray 900 at 20% now exports as `ColorTokens.colorGray900.copy(alpha = 0.2f)`. It was exported as the solid color.
- Colors that reference another color with their own opacity, shown in Supernova as "Brand / 40%", now export as `colorBrand.copy(alpha = 0.4f)`, so they follow the source color. They were a fixed `Color(0x66…)`. With references off they are written as the resolved color.
- A token is declared below the tokens in its file that it references, so a chain of aliases, a color with its own opacity on an alias, or a typography token whose parts reference other tokens no longer stops the generated file from compiling.

## 1.0.0 - 2026-11-23

### 🚀 New
- The Jetpack Compose exporter is out of beta.

### 🐞 Fixed
- A word repeated inside one token or group name now stays in the property name instead of being written once, which could add a `Copy1` suffix.

## 0.0.1 - 2025-06-06

### 🚀 New
- Initial beta release of the Jetpack Compose exporter. We are actively looking for feedback to improve it further.
