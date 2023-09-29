import { ShadowToken, Token } from "@supernova-studio/pulsar-next"
import { colorTokenValue } from "../content/token-value"

export function findAliases(token, allTokens) {
  let aliases = allTokens.filter((t) => t.value.referencedToken && t.value.referencedToken.id === token.id)
  for (const t of aliases) {
    aliases = aliases.concat(findAliases(t, allTokens))
  }
  return aliases
}

export function gradientAngle(from: { x: number; y: number }, to: { x: number; y: number }) {
  var deltaY = to.y - from.y
  var deltaX = to.x - from.x
  var radians = Math.atan2(deltaY, deltaX)
  var result = (radians * 180) / Math.PI
  result = result + 90
  return (result < 0 ? 360 + result : result) % 360
}

/** Describe complex shadow token */
/*
export function shadowDescription(shadowToken: ShadowToken) {
  let connectedShadow = "transparent"
  if (shadowToken.shadowLayers) {
    connectedShadow = shadowToken.shadowLayers
      .reverse()
      .map((shadow) => {
        return shadowTokenValue(shadow)
      })
      .join(", ")
  } else {
    return shadowTokenValue(shadowToken)
  }

  return connectedShadow ?? ""
}

/** Convert complex shadow value to CSS representation */
/*
export function shadowTokenValue(shadowToken, mappedTokens: Map<string, Token>) {
  var blurRadius = getValueWithCorrectUnit(nonNegativeValue(shadowToken.value.radius.measure))
  var offsetX = getValueWithCorrectUnit(shadowToken.value.x.measure)
  var offsetY = getValueWithCorrectUnit(shadowToken.value.y.measure)
  var spreadRadius = getValueWithCorrectUnit(shadowToken.value.spread.measure)

  return `${shadowToken.value.type === "Inner" ? "inset " : ""}${offsetX} ${offsetY} ${blurRadius} ${spreadRadius} ${colorTokenValue(
    shadowToken.value
  )}`
}
*/

export function getValueWithCorrectUnit(value) {
  if (value === 0) {
    return `${value}`
  } else {
    return `${value}px`
  }
}

export function nonNegativeValue(num) {
  if (num <= 0) {
    return 0
  } else {
    return num
  }
}
