import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import { type ExporterConfiguration } from "../config"
import { getContextArea, listWorkspaceSkills } from "./utils/context-api"
import { clearExportWarnings, warnExport, withExporterDiagnostics } from "./utils/export-log"
import { normalizeSkill, writeSkills } from "./utils/skill-utils"

/** Exporter configuration from the resolved default configuration and user overrides. */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

function skipExport(reason: string, context: PulsarContext, sdk: Supernova): Array<AnyOutputFile> {
  warnExport(reason)
  return withExporterDiagnostics([], context, sdk)
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
  clearExportWarnings()

  const contextArea = getContextArea(sdk)
  if (!contextArea) {
    return skipExport("Context API is not available in this export runtime.", context, sdk)
  }

  if (!context.wsId) {
    return skipExport("No workspace ID provided.", context, sdk)
  }

  if (!context.contextIds || context.contextIds.length === 0) {
    return skipExport("No context IDs provided.", context, sdk)
  }

  const dataSet = (await contextArea.getResolvedDatasetForContext(
    context.wsId,
    context.contextIds[0]
  )) as DatasetWithSkillFilter | null

  if (!dataSet || typeof dataSet.filteredSkills !== "function") {
    return skipExport(`No dataset found for context ${context.contextIds[0]}.`, context, sdk)
  }

  const skills = await listWorkspaceSkills(contextArea, context.wsId)
  if (skills.length === 0) {
    return skipExport("No skills found in workspace.", context, sdk)
  }

  const filteredSkills = dataSet.filteredSkills(skills as Array<{ id: string }>, dataSet)
  if (filteredSkills.length === 0) {
    return skipExport("No skills match the selected context.", context, sdk)
  }

  const exportableSkills = filteredSkills
    .map((result) => normalizeSkill(result.item))
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null)

  const outputFiles = writeSkills(exportableSkills, exportConfiguration)
  if (outputFiles.length === 0) {
    return skipExport("No skills with exportable content matched the selected context.", context, sdk)
  }

  return withExporterDiagnostics(outputFiles, context, sdk)
})
