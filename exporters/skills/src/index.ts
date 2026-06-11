import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import { getContextArea, getSkillsListMethod, listWorkspaceSkills } from "./utils/context-api"
import { createPulsarContextFile } from "./utils/pulsar-context-dump"
import { createSdkDebugFiles } from "./utils/sdk-debug-dump"

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
 * Debug mode: dumps raw SDK responses to ./_debug/*.txt plus ./PulsarContext.txt.
 * Throws on missing runtime prerequisites or empty SDK results.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  const contextArea = getContextArea(sdk)
  const wsId = requireWorkspaceId(context.wsId)
  const contextIds = requireContextIds(context.contextIds)
  const skillsListMethod = getSkillsListMethod(contextArea)

  const dataSet = (await contextArea.getResolvedDatasetForContext(wsId, contextIds[0])) as DatasetWithSkillFilter | null

  if (!dataSet || typeof dataSet.filteredSkills !== "function") {
    throw new Error(`No dataset found for context ${contextIds[0]}.`)
  }

  const skills = await listWorkspaceSkills(contextArea, wsId)

  if (skills.length === 0) {
    throw new Error("No skills found in workspace.")
  }

  const filteredSkills = dataSet.filteredSkills(skills as Array<{ id: string }>, dataSet)

  if (filteredSkills.length === 0) {
    throw new Error("No skills match the selected context.")
  }

  return [
    createPulsarContextFile(context, sdk),
    ...createSdkDebugFiles({
      skillsListMethod,
      dataset: dataSet,
      skills,
      filteredSkills
    })
  ]
})
