import type { Supernova } from "@supernovaio/sdk-exporters"

type ContextArea = {
  getResolvedDatasetForContext: (workspaceId: string, contextId: string) => Promise<unknown>
  listKnowledgeSkills?: (workspaceId: string) => Promise<Array<unknown>>
  listSkills?: (workspaceId: string) => Promise<Array<unknown>>
}

export function getContextArea(sdk: Supernova): ContextArea | null {
  const context = (sdk as Supernova & { context?: ContextArea }).context

  if (!context || typeof context.getResolvedDatasetForContext !== "function") {
    return null
  }

  return context
}

export async function listWorkspaceSkills(contextArea: ContextArea, workspaceId: string): Promise<Array<unknown>> {
  if (typeof contextArea.listKnowledgeSkills === "function") {
    return contextArea.listKnowledgeSkills(workspaceId)
  }

  if (typeof contextArea.listSkills === "function") {
    return contextArea.listSkills(workspaceId)
  }

  return []
}
