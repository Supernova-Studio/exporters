import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import { type ExporterConfiguration } from "../config"
import { type ExportableSkill, writeSkills } from "./utils/skill-utils"

/** Exporter configuration from the resolved default configuration and user overrides. */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Export entrypoint.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  if (!context.contextIds || context.contextIds.length === 0) {
    throw new Error("No context IDs provided")
  }

  // Get dataset
  const dataSet = await sdk.context.getResolvedDatasetForContext(context.wsId, context.contextIds[0])
  if (!dataSet) {
    throw new Error("No context found")
  }

  // Get list of skills passing dataset validation
  const skills = await sdk.context.listSkills(context.wsId)
  const filteredSkills = dataSet.filteredSkills(skills, dataSet)

  // Write skills to output
  return writeSkills(
    filteredSkills.map((result) => result.item as ExportableSkill),
    exportConfiguration
  )
})
