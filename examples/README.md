# MCP Client Configuration Examples

These examples show how to run `github-health-monitor` as a stdio MCP server from common client configuration formats.

## Build the server first

From the repository root:

```bash
npm install
npm run build
```

Confirm the compiled entrypoint exists:

```bash
ls dist/index.js
```

## Find the absolute path to `dist/index.js`

Most MCP clients need an absolute path. From the repository root, run:

```bash
pwd
```

Then append `/dist/index.js`.

Example:

```text
/Users/alex/code/github-health-monitor/dist/index.js
```

## Examples

- [`claude-desktop.json`](claude-desktop.json) uses the `mcpServers` shape expected by Claude Desktop and other clients that follow that convention.
- [`generic-client.json`](generic-client.json) shows the same stdio command as explicit transport metadata for clients that do not use the Claude Desktop config shape.

The example files are strict JSON so they can be copied directly into clients. The table below explains each option.

## Configuration options

| Option | Required | Purpose |
| --- | --- | --- |
| `command` | Yes | Executable used to start the MCP server. Use `node` for the built JavaScript entrypoint. |
| `args` | Yes | Absolute path to `dist/index.js`. |
| `GITHUB_TOKEN` | Recommended | GitHub token used by Octokit. This improves rate limits and enables private repository access when the token has permission. |
| `STALE_BRANCH_DAYS` | No | Branches older than this threshold are reported as stale. Default: `30`. |
| `OLD_PR_DAYS` | No | Pull requests open longer than this threshold are reported as old. Default: `14`. |
| `UNRESPONSIVE_ISSUE_DAYS` | No | Issues without updates longer than this threshold are reported as unresponsive. Default: `7`. |

Do not commit real GitHub tokens. Keep them in your local MCP client config or secret manager.

## Smoke test

After adding the config to a client, call the `check_health` tool with:

```json
{
  "owner": "IN3PIRE",
  "repo": "github-health-monitor"
}
```

The response should include counts for stale branches, old PRs, unresponsive issues, and security alerts.
