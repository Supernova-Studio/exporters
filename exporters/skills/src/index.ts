import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import { type ExporterConfiguration } from "../config"
import { getContextArea, listWorkspaceSkills } from "./utils/context-api"
import { warnExport } from "./utils/export-log"
import { normalizeSkill, writeSkills } from "./utils/skill-utils"

/** Exporter configuration from the resolved default configuration and user overrides. */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

function skipExport(reason: string): Array<AnyOutputFile> {
  warnExport(reason)
  return []
}

type DatasetWithSkillFilter = {
  filteredSkills: <TSkill extends { id: string }>(
    allSkills: readonly TSkill[],
    inheritedDataset?: DatasetWithSkillFilter
  ) => Array<{ item: TSkill }>
}

/**
 * Export entrypoint.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  const contextArea = getContextArea(sdk)
  if (!contextArea) {
    return skipExport("Context API is not available in this export runtime.")
  }

  if (!context.wsId) {
    return skipExport("No workspace ID provided.")
  }

  if (!context.contextIds || context.contextIds.length === 0) {
    return skipExport("No context IDs provided.")
  }

  const dataSet = (await contextArea.getResolvedDatasetForContext(
    context.wsId,
    context.contextIds[0]
  )) as DatasetWithSkillFilter | null

  if (!dataSet || typeof dataSet.filteredSkills !== "function") {
    return skipExport(`No dataset found for context ${context.contextIds[0]}.`)
  }

  const skills = await listWorkspaceSkills(contextArea, context.wsId)
  if (skills.length === 0) {
    return skipExport("No skills found in workspace.")
  }

  const filteredSkills = dataSet.filteredSkills(skills as Array<{ id: string }>, dataSet)
  if (filteredSkills.length === 0) {
    return skipExport("No skills match the selected context.")
  }

  const exportableSkills = filteredSkills
    .map((result) => normalizeSkill(result.item))
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null)

  const outputFiles = writeSkills(exportableSkills, exportConfiguration)
  if (outputFiles.length === 0) {
    return skipExport("No skills with exportable content matched the selected context.")
  }

  return outputFiles
})
