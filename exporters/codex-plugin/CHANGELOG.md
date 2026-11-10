# Changelog

## 1.0.0

- Initial release of the Codex plugin exporter.
- Exports `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `.mcp.json`, context skills, bundled MCP and feedback skills, and optional `README.md`.
- Codex `interface` metadata: display name, descriptions, category, brand color, legal URLs, default prompts, and hardcoded `capabilities: ["Read"]`.
- Marketplace policies configurable via `marketplaceInstallationPolicy` and `marketplaceAuthenticationPolicy`.
