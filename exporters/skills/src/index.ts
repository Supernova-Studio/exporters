import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import type { ExporterConfiguration } from "../config"
import { normalizeSkill, writeSkills, type ExportableSkill } from "./utils/skill-utils"
import { getContextArea, listWorkspaceSkills } from "./utils/context-api"

export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

type DatasetWithSkillFilter = {
  filteredSkills: <TSkill extends { id: string }>(
    allSkills: readonly TSkill[],
    inheritedDataset?: DatasetWithSkillFilter
  ) => Array<{ item: TSkill; source?: unknown }>
}

function requireWorkspaceId(wsId: string | undefined): string {
  if (!wsId) {
    throw new Error("No workspace ID provided.")
  }

  return wsId
}

function requireContextIds(contextIds: string[] | null | undefined): Array<string> {
  if (!contextIds || contextIds.length === 0) {
    throw new Error("No context IDs provided.")
  }

  return contextIds
}

/**
 * Export entrypoint.
 *
 * Export agent skills selected by the current context.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  const contextArea = getContextArea(sdk)
  const wsId = requireWorkspaceId(context.wsId)
  const contextIds = requireContextIds(context.contextIds)

  const dataSet = (await contextArea.getResolvedDatasetForContext(wsId, contextIds[0])) as DatasetWithSkillFilter | null

  if (!dataSet || typeof dataSet.filteredSkills !== "function") {
    throw new Error(`No dataset found for context ${contextIds[0]}.`)
  }

  const skills = await listWorkspaceSkills(contextArea, wsId)

  const filteredSkillResults =
    skills.length === 0 ? [] : dataSet.filteredSkills(skills as Array<{ id: string }>, dataSet)
  const normalizedSkills = filteredSkillResults
    .map(({ item }) => normalizeSkill(item))
    .filter((skill): skill is ExportableSkill => skill !== null)

  return normalizedSkills.length === 0 ? [] : writeSkills(normalizedSkills, exportConfiguration)
})
