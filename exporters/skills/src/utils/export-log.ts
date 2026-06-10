import {
  OutputFileType,
  type AnyOutputFile,
  type OutputTextFile,
  type PulsarContext,
  type Supernova
} from "@supernovaio/sdk-exporters"
import { createPulsarContextFile } from "./pulsar-context-dump"

const EXPORTER_LOG_PREFIX = "[Agentic Skills exporter]"
const WARNINGS_LOG_NAME = "warnings.log"

const exportWarnings: Array<string> = []

export function clearExportWarnings(): void {
  exportWarnings.length = 0
}

export function warnExport(message: string): void {
  const fullMessage = `${EXPORTER_LOG_PREFIX} ${message}`
  exportWarnings.push(fullMessage)

  const consoleObject = globalThis.console

  if (typeof consoleObject?.warn === "function") {
    consoleObject.warn(fullMessage)
    return
  }

  if (typeof consoleObject?.log === "function") {
    consoleObject.log(fullMessage)
  }
}

export function createWarningsLogFile(): OutputTextFile | null {
  if (exportWarnings.length === 0) {
    return null
  }

  return {
    type: OutputFileType.text,
    path: ".",
    name: WARNINGS_LOG_NAME,
    content: `${exportWarnings.join("\n")}\n`
  }
}

export function withExporterDiagnostics(
  outputFiles: Array<AnyOutputFile>,
  context: PulsarContext,
  sdk: Supernova
): Array<AnyOutputFile> {
  const diagnostics: Array<AnyOutputFile> = [createPulsarContextFile(context, sdk)]
  const warningsLog = createWarningsLogFile()

  if (warningsLog) {
    diagnostics.push(warningsLog)
  }

  return [...outputFiles, ...diagnostics]
}
