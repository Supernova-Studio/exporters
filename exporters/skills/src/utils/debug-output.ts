import {
  OutputFileType,
  type AnyOutputFile,
  type OutputTextFile,
  type PulsarContext,
  type Supernova
} from "@supernovaio/sdk-exporters"
import type { ExportableSkill } from "./skill-utils"

type DebugInput = {
  context: PulsarContext
  sdk: Supernova
  skillsListMethod: string
  dataset: unknown
  skills: Array<unknown>
  filteredSkills: Array<unknown>
  normalizedSkills: Array<ExportableSkill>
  outputFiles: Array<AnyOutputFile>
}

function serializeValue(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value !== "object") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (seen.has(value)) {
    return "[Circular]"
  }

  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item, seen))
  }

  const record = value as Record<string, unknown> & { toRemote?: () => unknown }

  if (typeof record.toRemote === "function") {
    return serializeValue(record.toRemote(), seen)
  }

  return Object.keys(record)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      if (typeof record[key] !== "function") {
        result[key] = serializeValue(record[key], seen)
      }

      return result
    }, {})
}

function serialize(value: unknown): string {
  if (value === undefined) {
    return "(undefined)\n"
  }

  return `${JSON.stringify(serializeValue(value), null, 2)}\n`
}

function debugFile(name: string, title: string, value: unknown): OutputTextFile {
  return {
    type: OutputFileType.text,
    path: "_debug",
    name,
    content: `${title}\n\n${serialize(value)}`
  }
}

function contextMethodNames(sdk: Supernova): Array<string> {
  const context = (sdk as Supernova & { context?: Record<string, unknown> }).context

  return context
    ? Object.keys(context)
        .filter((key) => typeof context[key] === "function")
        .sort()
    : []
}

function outputFileSummary(outputFiles: Array<AnyOutputFile>): Array<Record<string, unknown>> {
  return outputFiles.map((file) => {
    const record = file as Record<string, unknown>

    return {
      type: record.type,
      path: record.path,
      name: record.name
    }
  })
}

export function createDebugFiles(input: DebugInput): Array<AnyOutputFile> {
  return [
    debugFile("context.txt", "Pulsar context and available SDK context methods", {
      context: input.context,
      sdkContextMethods: contextMethodNames(input.sdk),
      skillsListMethod: input.skillsListMethod
    }),
    debugFile("dataset.txt", "SDK response: context.getResolvedDatasetForContext(wsId, contextIds[0])", input.dataset),
    debugFile("skills.txt", `SDK response: context.${input.skillsListMethod}(wsId)`, input.skills),
    debugFile("filtered-skills.txt", "SDK response: dataset.filteredSkills(skills, dataset)", input.filteredSkills),
    debugFile("normalized-skills.txt", "Exporter-normalized skills used for output", input.normalizedSkills),
    debugFile("output-files.txt", "Generated output file metadata", outputFileSummary(input.outputFiles))
  ]
}
