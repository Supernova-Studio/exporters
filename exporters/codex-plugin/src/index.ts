import { Pulsar, type AnyOutputFile, type PulsarContext, type Supernova } from "@supernovaio/sdk-exporters"
import type { ExporterConfiguration } from "../config"
import { createBundledSkills } from "./utils/bundled-skills"
import {
  getContextArea,
  getProjectContextMetadata,
  getWorkspaceMetadata,
  listWorkspaceSkills
} from "./utils/context-api"
import {
  createMarketplaceFile,
  createMcpConfigFile,
  createPluginManifestFile,
  resolvePluginMetadata
} from "./utils/plugin-files"
import { createReadmeFile } from "./utils/readme"
import {
  normalizeSkill,
  writeContextSkills,
  type ExportableSkill,
  type ExportedSkillSummary
} from "./utils/skill-utils"

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

function requireContextId(contextIds: string[] | null | undefined): string {
  if (!contextIds || contextIds.length === 0) {
    throw new Error("No context ID provided.")
  }

  return contextIds[0]
}

function outputKey(file: AnyOutputFile): string {
  return `${file.path}/${file.name}`
}

/**
 * Export entrypoint.
 *
 * Export a Supernova context as a Codex plugin.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  const wsId = requireWorkspaceId(context.wsId)
  const contextId = requireContextId(context.contextIds)
  const contextMetadata = await getProjectContextMetadata(sdk, contextId)
  const pluginMetadata = resolvePluginMetadata(exportConfiguration, contextMetadata)
  const outputFiles = new Map<string, AnyOutputFile>()
  const skillSummaries: Array<ExportedSkillSummary> = []

  const addFiles = (files: Array<AnyOutputFile>) => {
    for (const file of files) {
      outputFiles.set(outputKey(file), file)
    }
  }

  const pluginManifestFile = createPluginManifestFile(pluginMetadata, exportConfiguration.includeMcpServer)
  outputFiles.set(outputKey(pluginManifestFile), pluginManifestFile)

  if (exportConfiguration.includeMcpServer) {
    const mcpConfigFile = createMcpConfigFile(contextMetadata)
    outputFiles.set(outputKey(mcpConfigFile), mcpConfigFile)
  }

  if (exportConfiguration.includeContextSkills) {
    const contextArea = getContextArea(sdk)
    const dataSet = (await contextArea.getResolvedDatasetForContext(wsId, contextId)) as DatasetWithSkillFilter | null

    if (!dataSet || typeof dataSet.filteredSkills !== "function") {
      throw new Error(`No dataset found for context ${contextId}.`)
    }

    const skills = await listWorkspaceSkills(contextArea, wsId)
    const filteredSkillResults =
      skills.length === 0 ? [] : dataSet.filteredSkills(skills as Array<{ id: string }>, dataSet)
    const normalizedSkills = filteredSkillResults
      .map(({ item }) => normalizeSkill(item))
      .filter((skill): skill is ExportableSkill => skill !== null)
    const contextSkillOutput = writeContextSkills(normalizedSkills, exportConfiguration)

    addFiles(contextSkillOutput.files)
    skillSummaries.push(...contextSkillOutput.summaries)
  }

  const bundledSkills = createBundledSkills(exportConfiguration, contextMetadata)
  addFiles(bundledSkills.files)
  skillSummaries.push(...bundledSkills.summaries)

  if (exportConfiguration.includeMarketplaceManifest) {
    const marketplaceFile = createMarketplaceFile(pluginMetadata)
    outputFiles.set(outputKey(marketplaceFile), marketplaceFile)
  }

  if (exportConfiguration.includeReadme) {
    const readmeFile = createReadmeFile(
      pluginMetadata,
      contextMetadata,
      skillSummaries,
      exportConfiguration.includeMcpServer,
      exportConfiguration.includeMarketplaceManifest
    )
    outputFiles.set(outputKey(readmeFile), readmeFile)
  }

  return [...outputFiles.values()]
})
