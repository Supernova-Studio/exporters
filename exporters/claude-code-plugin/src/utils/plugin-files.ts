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

  if (metadata.authorUrl) {
    entries.push(["url", metadata.authorUrl])
  }

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function githubRepoFromUrl(url: string): string | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/#?]+?)(?:\.git)?(?:[#?].*)?$/i)
  return match?.[1] ?? null
}

function marketplaceSource(repositoryUrl: string | undefined): string | Record<string, string> {
  if (!repositoryUrl) {
    return "./"
  }

  const githubRepo = githubRepoFromUrl(repositoryUrl)
  if (githubRepo) {
    return {
      source: "github",
      repo: githubRepo
    }
  }

  return {
    source: "url",
    url: repositoryUrl
  }
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
      `Claude Code plugin for the ${contextMetadata.name} Supernova context.`,
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
  return jsonFile("", ".mcp.json", {
    mcpServers: {
      [MCP_SERVER_NAME]: {
        type: "http",
        url: contextMcpUrl(contextMetadata)
      }
    }
  })
}

export function createPluginManifestFile(metadata: ResolvedPluginMetadata): OutputTextFile {
  return jsonFile(".claude-plugin", "plugin.json", {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    author: optionalAuthor(metadata),
    homepage: metadata.homepage,
    repository: metadata.repositoryUrl
      ? {
          type: "git",
          url: metadata.repositoryUrl
        }
      : undefined,
    license: metadata.license,
    keywords: metadata.keywords
  })
}

export function createMarketplaceFile(metadata: ResolvedPluginMetadata, workspaceName: string): OutputTextFile {
  const author = optionalAuthor(metadata)

  return jsonFile(".claude-plugin", "marketplace.json", {
    name: metadata.name,
    owner: author ?? {
      name: workspaceName
    },
    plugins: [
      {
        name: metadata.name,
        source: marketplaceSource(metadata.repositoryUrl),
        description: metadata.description,
        version: metadata.version,
        author,
        category: "design-systems",
        tags: metadata.keywords
      }
    ]
  })
}
