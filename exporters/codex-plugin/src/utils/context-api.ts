import type { Supernova } from "@supernovaio/sdk-exporters"

type ContextArea = {
  getResolvedDatasetForContext: (workspaceId: string, contextId: string) => Promise<unknown>
  listKnowledgeSkills?: (workspaceId: string) => Promise<Array<unknown>>
  listSkills?: (workspaceId: string) => Promise<Array<unknown>>
}

type ProjectsArea = {
  getProjectContext: (contextId: string) => Promise<unknown>
}

type WorkspacesArea = {
  workspace: (workspaceId: string) => Promise<unknown>
}

export type ProjectContextMetadata = {
  id: string
  name: string
  description?: string
  mcpUrlSlug?: string
  isFeedbackCollectionEnabled: boolean
  isFeedbackCollectionAnonymous: boolean
}

export type WorkspaceMetadata = {
  id: string
  name: string
}

function remoteValue(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown> & { toRemote?: () => unknown }
  const remote = typeof record.toRemote === "function" ? record.toRemote() : record

  return remote && typeof remote === "object" ? (remote as Record<string, unknown>) : null
}

export function getContextArea(sdk: Supernova): ContextArea {
  const context = (sdk as Supernova & { context?: ContextArea }).context

  if (!context || typeof context.getResolvedDatasetForContext !== "function") {
    throw new Error("Context API is not available in this export runtime.")
  }

  return context
}

function getProjectsArea(sdk: Supernova): ProjectsArea {
  const projects = (sdk as Supernova & { projects?: ProjectsArea }).projects

  if (!projects || typeof projects.getProjectContext !== "function") {
    throw new Error("Projects API is not available in this export runtime.")
  }

  return projects
}

function getWorkspacesArea(sdk: Supernova): WorkspacesArea {
  const workspaces = (sdk as Supernova & { workspaces?: WorkspacesArea }).workspaces

  if (!workspaces || typeof workspaces.workspace !== "function") {
    throw new Error("Workspaces API is not available in this export runtime.")
  }

  return workspaces
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

export async function getProjectContextMetadata(sdk: Supernova, contextId: string): Promise<ProjectContextMetadata> {
  const context = remoteValue(await getProjectsArea(sdk).getProjectContext(contextId))

  if (!context) {
    throw new Error(`No project context metadata found for context ${contextId}.`)
  }

  const id = typeof context.id === "string" ? context.id : contextId
  const name = typeof context.name === "string" && context.name.trim() ? context.name : contextId
  const description = typeof context.description === "string" ? context.description : undefined
  const mcpUrlSlug = typeof context.mcpUrlSlug === "string" ? context.mcpUrlSlug : undefined

  return {
    id,
    name,
    description,
    mcpUrlSlug,
    isFeedbackCollectionEnabled: context.isFeedbackCollectionEnabled === true,
    isFeedbackCollectionAnonymous: context.isFeedbackCollectionAnonymous === true
  }
}

export async function getWorkspaceMetadata(sdk: Supernova, workspaceId: string): Promise<WorkspaceMetadata> {
  const workspace = remoteValue(await getWorkspacesArea(sdk).workspace(workspaceId))
  const profile = remoteValue(workspace?.profile)

  if (!workspace) {
    throw new Error(`No workspace metadata found for workspace ${workspaceId}.`)
  }

  return {
    id: typeof workspace.id === "string" ? workspace.id : workspaceId,
    name: typeof profile?.name === "string" && profile.name.trim() ? profile.name : workspaceId
  }
}
