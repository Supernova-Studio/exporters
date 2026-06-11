import { OutputFileType, type OutputTextFile } from "@supernovaio/sdk-exporters"
import { serializeSdkValue } from "./sdk-serialize"

const DEBUG_OUTPUT_PATH = "./_debug"

type SdkDebugDump = {
  skillsListMethod: string
  dataset: unknown
  skills: Array<unknown>
  filteredSkills: Array<unknown>
}

function createDebugTextFile(name: string, heading: string, body: string): OutputTextFile {
  return {
    type: OutputFileType.text,
    path: DEBUG_OUTPUT_PATH,
    name,
    content: `${heading}\n\n${body}`
  }
}

export function createSdkDebugFiles(dump: SdkDebugDump): Array<OutputTextFile> {
  return [
    createDebugTextFile(
      "getResolvedDatasetForContext.txt",
      "SDK response: context.getResolvedDatasetForContext(wsId, contextIds[0])",
      serializeSdkValue(dump.dataset)
    ),
    createDebugTextFile(
      "listSkills.txt",
      `SDK response: context.${dump.skillsListMethod}(wsId)`,
      serializeSdkValue(dump.skills)
    ),
    createDebugTextFile(
      "filteredSkills.txt",
      "SDK response: dataset.filteredSkills(skills, dataset)",
      serializeSdkValue(dump.filteredSkills)
    )
  ]
}
