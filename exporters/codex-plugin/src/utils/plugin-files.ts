import type { OutputTextFile } from "@supernovaio/sdk-exporters"
import type { ExporterConfiguration } from "../../config"
import type { ProjectContextMetadata } from "./context-api"
import { jsonFile } from "./output"
import { slugify, trimToUndefined } from "./strings"

const MCP_SERVER_BASE_URL = "https://mcp.supernova.io"
const MCP_SERVER_NAME = "supernova"
const PLUGIN_CAPABILITIES = ["Read"] as const
const DEFAULT_PROMPT_MAX_COUNT = 3
const DEFAULT_PROMPT_MAX_LENGTH = 128

export type ResolvedPluginMetadata = {
  name: string
  version: string
  description: string
  displayName: string
  longDescription?: string
  category: string
  authorName?: string
  authorEmail?: string
  authorUrl?: string
  homepage?: string
  repositoryUrl?: string
  license?: string
  keywords: string[]
  brandColor?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  defaultPrompts: string[]
  marketplaceInstallationPolicy: ExporterConfiguration["marketplaceInstallationPolicy"]
  marketplaceAuthenticationPolicy: ExporterConfiguration["marketplaceAuthenticationPolicy"]
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

function httpsUrlOrUndefined(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return /^https:\/\//i.test(value) ? value : undefined
}

function clampDefaultPrompts(prompts: string[]): string[] {
  return prompts
    .map((prompt) => prompt.trim())
    .filter(Boolean)
    .slice(0, DEFAULT_PROMPT_MAX_COUNT)
    .map((prompt) => prompt.slice(0, DEFAULT_PROMPT_MAX_LENGTH))
}

function buildInterface(metadata: ResolvedPluginMetadata): Record<string, unknown> {
  const interfaceBlock: Record<string, unknown> = {
    displayName: metadata.displayName,
    shortDescription: metadata.description,
    category: metadata.category,
    capabilities: [...PLUGIN_CAPABILITIES]
  }

  if (metadata.longDescription) {
    interfaceBlock.longDescription = metadata.longDescription
  }

  if (metadata.authorName) {
    interfaceBlock.developerName = metadata.authorName
  }

  const websiteUrl = httpsUrlOrUndefined(metadata.homepage)
  if (websiteUrl) {
    interfaceBlock.websiteURL = websiteUrl
  }

  const privacyPolicyUrl = httpsUrlOrUndefined(metadata.privacyPolicyUrl)
  if (privacyPolicyUrl) {
    interfaceBlock.privacyPolicyURL = privacyPolicyUrl
  }

  const termsOfServiceUrl = httpsUrlOrUndefined(metadata.termsOfServiceUrl)
  if (termsOfServiceUrl) {
    interfaceBlock.termsOfServiceURL = termsOfServiceUrl
  }

  if (metadata.defaultPrompts.length > 0) {
    interfaceBlock.defaultPrompt = metadata.defaultPrompts
  }

  if (metadata.brandColor) {
    interfaceBlock.brandColor = metadata.brandColor
  }

  return interfaceBlock
}

function marketplaceSource(repositoryUrl: string | undefined): Record<string, string> {
  if (repositoryUrl) {
    return {
      source: "url",
      url: repositoryUrl
    }
  }

  return {
    source: "local",
    path: "./"
  }
}

export function resolvePluginMetadata(
  exportConfiguration: ExporterConfiguration,
  contextMetadata: ProjectContextMetadata
): ResolvedPluginMetadata {
  const configuredName = trimToUndefined(exportConfiguration.pluginName)
  const configuredDescription = trimToUndefined(exportConfiguration.pluginDescription)
  const configuredDisplayName = trimToUndefined(exportConfiguration.pluginDisplayName)
  const keywords = (exportConfiguration.pluginKeywords ?? [])
    .filter((keyword): keyword is string => typeof keyword === "string")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
  const defaultPrompts = clampDefaultPrompts(
    (exportConfiguration.pluginDefaultPrompts ?? []).filter((prompt): prompt is string => typeof prompt === "string")
  )

  return {
    name: slugify(configuredName ?? contextMetadata.name),
    version: trimToUndefined(exportConfiguration.pluginVersion) ?? "1.0.0",
    description:
      configuredDescription ??
      contextMetadata.description ??
      `Codex plugin for the ${contextMetadata.name} Supernova context.`,
    displayName: configuredDisplayName ?? contextMetadata.name,
    longDescription: trimToUndefined(exportConfiguration.pluginLongDescription),
    category: trimToUndefined(exportConfiguration.pluginCategory) ?? "Design systems",
    authorName: trimToUndefined(exportConfiguration.pluginAuthorName),
    authorEmail: trimToUndefined(exportConfiguration.pluginAuthorEmail),
    authorUrl: trimToUndefined(exportConfiguration.pluginAuthorUrl),
    homepage: trimToUndefined(exportConfiguration.pluginHomepage),
    repositoryUrl: trimToUndefined(exportConfiguration.pluginRepositoryUrl),
    license: trimToUndefined(exportConfiguration.pluginLicense),
    keywords,
    brandColor: trimToUndefined(exportConfiguration.pluginBrandColor),
    privacyPolicyUrl: trimToUndefined(exportConfiguration.pluginPrivacyPolicyUrl),
    termsOfServiceUrl: trimToUndefined(exportConfiguration.pluginTermsOfServiceUrl),
    defaultPrompts,
    marketplaceInstallationPolicy: exportConfiguration.marketplaceInstallationPolicy ?? "AVAILABLE",
    marketplaceAuthenticationPolicy: exportConfiguration.marketplaceAuthenticationPolicy ?? "ON_INSTALL"
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

export function createPluginManifestFile(metadata: ResolvedPluginMetadata, includeMcpServer: boolean): OutputTextFile {
  const manifest: Record<string, unknown> = {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    author: optionalAuthor(metadata),
    homepage: metadata.homepage,
    repository: metadata.repositoryUrl,
    license: metadata.license,
    keywords: metadata.keywords,
    skills: "./skills/",
    interface: buildInterface(metadata)
  }

  if (includeMcpServer) {
    manifest.mcpServers = "./.mcp.json"
  }

  return jsonFile(".codex-plugin", "plugin.json", manifest)
}

export function createMarketplaceFile(metadata: ResolvedPluginMetadata): OutputTextFile {
  return jsonFile(".agents/plugins", "marketplace.json", {
    name: metadata.name,
    interface: {
      displayName: metadata.displayName
    },
    plugins: [
      {
        name: metadata.name,
        source: marketplaceSource(metadata.repositoryUrl),
        policy: {
          installation: metadata.marketplaceInstallationPolicy,
          authentication: metadata.marketplaceAuthenticationPolicy
        },
        category: metadata.category
      }
    ]
  })
}
