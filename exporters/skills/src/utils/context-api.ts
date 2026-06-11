import type { Supernova } from "@supernovaio/sdk-exporters"

type ContextArea = {
  getResolvedDatasetForContext: (workspaceId: string, contextId: string) => Promise<unknown>
  listKnowledgeSkills?: (workspaceId: string) => Promise<Array<unknown>>
  listSkills?: (workspaceId: string) => Promise<Array<unknown>>
}

export function getContextArea(sdk: Supernova): ContextArea {
  const context = (sdk as Supernova & { context?: ContextArea }).context

  if (!context || typeof context.getResolvedDatasetForContext !== "function") {
    throw new Error("Context API is not available in this export runtime.")
  }

  return context
}

export function getSkillsListMethod(contextArea: ContextArea): "listKnowledgeSkills" | "listSkills" {
  if (typeof contextArea.listKnowledgeSkills === "function") {
    return "listKnowledgeSkills"
  }

  if (typeof contextArea.listSkills === "function") {
    return "listSkills"
  }

  throw new Error("Neither listKnowledgeSkills nor listSkills is available on sdk.context.")
}

export async function listWorkspaceSkills(contextArea: ContextArea, workspaceId: string): Promise<Array<unknown>> {
  const method = getSkillsListMethod(contextArea)
  return contextArea[method]!(workspaceId)
}
