# GitHub Health Monitor MCP Skill

Monitor, analyze, and improve GitHub repository health with intelligent MCP tooling.

## Description

This skill provides comprehensive GitHub repository health monitoring capabilities through the Model Context Protocol (MCP). It helps you track stale branches, aging pull requests, inactive issues, and security vulnerabilities—all through standardized MCP interfaces.

## Capabilities

- 🌿 **Stale Branch Detection** - Identify branches untouched for extended periods
- 🔄 **Old PR Tracking** - Find pull requests awaiting review/merge
- 📋 **Unresponsive Issues** - Flag issues needing attention
- 🔒 **Security Alert Monitoring** - Track potential security concerns
- 📊 **Health Score Calculation** - Get overall repository health metrics

## Installation

### Method 1: Install from LobeHub Market

Click the badge in the repository README to install directly from LobeHub.

### Method 2: Install from GitHub URL

Install directly from this GitHub repository:

```
https://github.com/IN3PIRE/github-health-monitor-mcp
```

## Setup

### Prerequisites

- Node.js 20+
- npm or compatible package manager
- GitHub Personal Access Token (recommended for higher rate limits)

### Configuration

Configure the skill using these environment variables:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `GITHUB_TOKEN` | GitHub PAT for authenticated requests | — | `ghp_xxxxxxxxxxxx` |
| `STALE_BRANCH_DAYS` | Days before branch considered stale | `30` | `21` |
| `OLD_PR_DAYS` | Days before PR considered old | `14` | `7` |
| `UNRESPONSIVE_ISSUE_DAYS` | Days before issue needs attention | `7` | `3` |

### MCP Client Integration

Add to your MCP-compatible client configuration:

```json
{
  "mcpServers": {
    "github-health": {
      "command": "node",
      "args": ["/absolute/path/to/github-health-monitor-mcp/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GH_TOKEN}",
        "STALE_BRANCH_DAYS": "21"
      }
    }
  }
}
```

## Usage

### Repository Health Check

Check the health of any GitHub repository:

```javascript
const healthReport = await mcpClient.callTool("check_health", {
  owner: "facebook",
  repo: "react"
});
```

With custom thresholds:

```javascript
const strictHealth = await mcpClient.callTool("check_health", {
  owner: "vercel",
  repo: "next.js",
  staleBranchDays: 14,
  oldPRDays: 7,
  unresponsiveIssueDays: 3
});
```

### Read Health Metrics

Access real-time health snapshots:

```javascript
const metrics = await mcpClient.readResource("health://current");
```

Available resources:
- `health://current` - Real-time repository health snapshot
- `health://metrics` - Time-series health metrics
- `health://summary` - Condensed health report

## Example Output

```json
{
  "repository": "facebook/react",
  "timestamp": "2026-06-13T05:49:09Z",
  "staleBranches": [
    {
      "name": "feature/deprecated-component",
      "lastCommit": "2026-01-15T10:30:00Z",
      "author": "dev123",
      "daysStale": 45,
      "url": "https://github.com/facebook/react/tree/feature/deprecated-component"
    }
  ],
  "oldPRs": [
    {
      "number": 26784,
      "title": "Add experimental concurrent features",
      "author": "core-team",
      "createdAt": "2026-02-20T08:15:00Z",
      "daysOpen": 28,
      "reviewStatus": "changes-requested",
      "url": "https://github.com/facebook/react/pull/26784"
    }
  ],
  "unresponsiveIssues": [
    {
      "number": 24563,
      "title": "Bug: Suspense fallback shows briefly on fast networks",
      "author": "community-member",
      "createdAt": "2026-02-10T14:22:00Z",
      "lastUpdated": "2026-02-10T14:22:00Z",
      "daysSinceUpdate": 39,
      "assignee": null,
      "labels": ["bug", "needs-triage"],
      "url": "https://github.com/facebook/react/issues/24563"
    }
  ],
  "securityAlerts": [
    {
      "severity": "high",
      "package": "semver",
      "vulnerableVersion": "<7.5.2",
      "patchedVersion": "7.5.2",
      "description": "Regular Expression Denial of Service (ReDoS)"
    }
  ],
  "summary": {
    "totalStaleBranches": 3,
    "totalOldPRs": 7,
    "totalUnresponsiveIssues": 12,
    "totalSecurityAlerts": 1,
    "healthScore": 72
  }
}
```

## Use Cases

- **Daily Standups** - Quick health pulse before meetings
- **Release Readiness** - Ensure no blockers before shipping
- **Cleanup Campaigns** - Identify technical debt systematically
- **Security Audits** - Monitor for new vulnerabilities
- **CI/CD Integration** - Gate deployments on health thresholds
- **Scheduled Reports** - Daily/weekly health digests via automation

## Troubleshooting

### Rate Limiting

If you encounter rate limiting errors:

1. Set the `GITHUB_TOKEN` environment variable
2. Generate a token at [github.com/settings/tokens](https://github.com/settings/tokens) with `repo` scope
3. This increases your limit from 60 to 5,000 requests per hour

### Connection Issues

- Verify Node.js version (requires 20+): `node --version`
- Check port availability
- Review firewall settings

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines.

**Important**: You must star the repository before your PR can be merged.

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright © 2024 IN3PIRE

## Support

- ⭐ Star this repository to show support
- 🐛 [Report bugs](https://github.com/IN3PIRE/github-health-monitor-mcp/issues)
- 💡 [Request features](https://github.com/IN3PIRE/github-health-monitor-mcp/discussions)
- 💬 Join GitHub Discussions for roadmap and improvements