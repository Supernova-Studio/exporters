const EXPORTER_LOG_PREFIX = "[Agentic Skills exporter]"

export function warnExport(message: string): void {
  const fullMessage = `${EXPORTER_LOG_PREFIX} ${message}`
  const consoleObject = globalThis.console

  if (typeof consoleObject?.warn === "function") {
    consoleObject.warn(fullMessage)
    return
  }

  if (typeof consoleObject?.log === "function") {
    consoleObject.log(fullMessage)
  }
}
