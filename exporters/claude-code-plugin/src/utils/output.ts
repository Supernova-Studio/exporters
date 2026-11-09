import { OutputFileType, type OutputTextFile } from "@supernovaio/sdk-exporters"

export function textFile(path: string, name: string, content: string): OutputTextFile {
  return {
    type: OutputFileType.text,
    path,
    name,
    content
  }
}

export function jsonFile(path: string, name: string, value: unknown): OutputTextFile {
  return textFile(path, name, `${JSON.stringify(value, null, 2)}\n`)
}
