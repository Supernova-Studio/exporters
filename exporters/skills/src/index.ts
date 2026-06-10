import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import { type ExporterConfiguration } from "../config"
import { type ExportableSkill, writeSkills } from "./utils/skill-utils"

/** Exporter configuration from the resolved default configuration and user overrides. */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

const EXPORTER_LOG_PREFIX = "[Agentic Skills exporter]"

function skipExport(reason: string): Array<AnyOutputFile> {
  console.warn(`${EXPORTER_LOG_PREFIX} ${reason}`)
  return []
}

/**
 * Export entrypoint.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  if (!sdk.context) {
    return skipExport("Context API is not available in this export runtime.")
  }

  if (!context.wsId) {
    return skipExport("No workspace ID provided.")
  }

  if (!context.contextIds || context.contextIds.length === 0) {
    return skipExport("No context IDs provided.")
  }

  const dataSet = await sdk.context.getResolvedDatasetForContext(context.wsId, context.contextIds[0])
  if (!dataSet) {
    return skipExport(`No dataset found for context ${context.contextIds[0]}.`)
  }

  const skills = await sdk.context.listKnowledgeSkills(context.wsId)
  const filteredSkills = dataSet.filteredSkills(skills, dataSet)
  if (filteredSkills.length === 0) {
    return skipExport("No skills match the selected context.")
  }

  const exportableSkills: Array<ExportableSkill> = filteredSkills.map((result) => {
    const skill = result.item as ExportableSkill
    return {
      id: skill.id,
      path: skill.path,
      content: skill.content
    }
  })

  const outputFiles = writeSkills(exportableSkills, exportConfiguration)
  if (outputFiles.length === 0) {
    return skipExport("No skills with exportable content matched the selected context.")
  }

  return outputFiles
})
