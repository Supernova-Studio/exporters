import type { OutputTextFile } from "@supernovaio/sdk-exporters"
import type { ExporterConfiguration } from "../../config"
import type { ProjectContextMetadata } from "./context-api"
import { jsonFile } from "./output"
import { slugify, trimToUndefined } from "./strings"

const MCP_SERVER_BASE_URL = "https://mcp.supernova.io"
const MCP_SERVER_NAME = "supernova"

export type ResolvedPluginMetadata = {
  name: string
  version: string
  description: string
  authorName?: string
  authorEmail?: string
  authorUrl?: string
  homepage?: string
  repositoryUrl?: string
  license?: string
  keywords: string[]
}

function optionalAuthor(metadata: ResolvedPluginMetadata): Record<string, string> | undefined {
  const entries: Array<[string, string]> = []

  if (metadata.authorName) {
    entries.push(["name", metadata.authorName])
  }

  if (metadata.authorEmail) {
    entries.push(["email", metadata.authorEmail])
  }

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function optionalHomepage(metadata: ResolvedPluginMetadata): string | undefined {
  return metadata.homepage ?? metadata.authorUrl
}

export function resolvePluginMetadata(
  exportConfiguration: ExporterConfiguration,
  contextMetadata: ProjectContextMetadata
): ResolvedPluginMetadata {
  const configuredName = trimToUndefined(exportConfiguration.pluginName)
  const configuredDescription = trimToUndefined(exportConfiguration.pluginDescription)
  const keywords = (exportConfiguration.pluginKeywords ?? [])
    .filter((keyword): keyword is string => typeof keyword === "string")
    .map((keyword) => keyword.trim())
    .filter(Boolean)

  return {
    name: slugify(configuredName ?? contextMetadata.name),
    version: trimToUndefined(exportConfiguration.pluginVersion) ?? "1.0.0",
    description:
      configuredDescription ??
      contextMetadata.description ??
      `Cursor plugin for the ${contextMetadata.name} Supernova context.`,
    authorName: trimToUndefined(exportConfiguration.pluginAuthorName),
    authorEmail: trimToUndefined(exportConfiguration.pluginAuthorEmail),
    authorUrl: trimToUndefined(exportConfiguration.pluginAuthorUrl),
    homepage: trimToUndefined(exportConfiguration.pluginHomepage),
    repositoryUrl: trimToUndefined(exportConfiguration.pluginRepositoryUrl),
    license: trimToUndefined(exportConfiguration.pluginLicense),
    keywords
  }
}

export function contextMcpUrl(contextMetadata: ProjectContextMetadata): string {
  const readableSlug = contextMetadata.mcpUrlSlug ? slugify(contextMetadata.mcpUrlSlug) : undefined
  const contextPath = readableSlug ? `${contextMetadata.id}-${readableSlug}` : contextMetadata.id

  return `${MCP_SERVER_BASE_URL}/mcp/c/${contextPath}`
}

export function createMcpConfigFile(contextMetadata: ProjectContextMetadata): OutputTextFile {
  return jsonFile("", "mcp.json", {
    mcpServers: {
      [MCP_SERVER_NAME]: {
        type: "http",
        url: contextMcpUrl(contextMetadata)
      }
    }
  })
}

export function createPluginManifestFile(metadata: ResolvedPluginMetadata): OutputTextFile {
  return jsonFile(".cursor-plugin", "plugin.json", {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    author: optionalAuthor(metadata),
    homepage: optionalHomepage(metadata),
    repository: metadata.repositoryUrl,
    license: metadata.license,
    keywords: metadata.keywords
  })
}

export function createMarketplaceFile(metadata: ResolvedPluginMetadata, workspaceName: string): OutputTextFile {
  return jsonFile(".cursor-plugin", "marketplace.json", {
    name: metadata.name,
    owner: {
      name: metadata.authorName ?? workspaceName,
      email: metadata.authorEmail
    },
    metadata: {
      description: "Cursor plugin generated from a Supernova Context.",
      version: metadata.version
    },
    plugins: [
      {
        name: metadata.name,
        source: ".",
        description: metadata.description,
        version: metadata.version,
        author: optionalAuthor(metadata),
        homepage: optionalHomepage(metadata),
        repository: metadata.repositoryUrl,
        license: metadata.license,
        keywords: metadata.keywords,
        category: "developer-tools",
        tags: metadata.keywords
      }
    ]
  })
}
