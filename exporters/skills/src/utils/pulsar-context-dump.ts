import { OutputFileType, type PulsarContext, type Supernova, type OutputTextFile } from "@supernovaio/sdk-exporters"
import { getContextArea } from "./context-api"

const PULSAR_CONTEXT_FILE_NAME = "PulsarContext.txt"

function formatValue(value: unknown): string {
  if (value === undefined) {
    return "(undefined)"
  }

  if (value === null) {
    return "(null)"
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "(empty array)" : JSON.stringify(value, null, 2)
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

function listObjectKeys(value: unknown): Array<string> {
  if (!value || typeof value !== "object") {
    return []
  }

  return Object.keys(value as Record<string, unknown>).sort()
}

function listContextAreaMethods(sdk: Supernova): Array<string> {
  const contextArea = getContextArea(sdk)

  if (!contextArea) {
    return []
  }

  return Object.keys(contextArea as Record<string, unknown>)
    .filter((key) => typeof (contextArea as Record<string, unknown>)[key] === "function")
    .sort()
}

export function formatPulsarContextDump(context: PulsarContext, sdk: Supernova): string {
  const contextArea = getContextArea(sdk)
  const contextKeys = listObjectKeys(context)
  const typedFields: Array<[string, unknown]> = [
    ["executor", context.executor],
    ["wsId", context.wsId],
    ["dsId", context.dsId],
    ["versionId", context.versionId],
    ["brandId", context.brandId],
    ["themeId", context.themeId],
    ["themeIds", context.themeIds],
    ["contextIds", context.contextIds],
    ["isPreview", context.isPreview]
  ]

  const lines = [
    "Agentic Skills exporter — PulsarContext dump",
    "",
    "=== PulsarContext (typed fields) ===",
    ...typedFields.map(([key, value]) => `${key}: ${formatValue(value)}`),
    "",
    "=== PulsarContext (all keys on object) ===",
    ...(contextKeys.length > 0
      ? contextKeys.map((key) => `${key}: ${formatValue((context as Record<string, unknown>)[key])}`)
      : ["(no keys)"]),
    "",
    "=== SDK runtime ===",
    `sdk.context available: ${contextArea ? "yes" : "no"}`,
    `sdk.context methods: ${listContextAreaMethods(sdk).join(", ") || "(none)"}`
  ]

  return `${lines.join("\n")}\n`
}

export function createPulsarContextFile(context: PulsarContext, sdk: Supernova): OutputTextFile {
  return {
    type: OutputFileType.text,
    path: ".",
    name: PULSAR_CONTEXT_FILE_NAME,
    content: formatPulsarContextDump(context, sdk)
  }
}
