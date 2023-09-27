import { ColorTokenValue } from "@supernova-studio/pulsar-next"

export function colorValueToHex6(value: ColorTokenValue): string {
  return `#${[value.color.r, value.color.g, value.color.b]
    .map((x) => {
      const hex = x.toString(16)

      return hex.length === 1 ? `0${hex}` : hex
    })
    .join("")
    .toLowerCase()}`
}

export function colorValueToHex8(value: ColorTokenValue): string {
  return `#${[value.color.r, value.color.g, value.color.b, Math.round(value.opacity.measure * 255)]
    .map((x) => {
      const hex = x.toString(16)

      return hex.length === 1 ? `0${hex}` : hex
    })
    .join("")
    .toLowerCase()}`
}
