# GitHub Health Monitor MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.0+-orange.svg)](https://github.com/modelcontextprotocol/typescript-sdk)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm](https://img.shields.io/badge/npm-%E2%9C%93-brightgreen.svg)](https://www.npmjs.com/)

🚀 **Monitor, analyze, and improve your GitHub repository health with intelligent MCP tooling.**

GitHub Health Monitor is a powerful [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that continuously tracks critical repository health metrics. Get instant insights into stale branches, aging pull requests, inactive issues, and security vulnerabilities—all through standardized MCP interfaces that integrate seamlessly with AI assistants and automation tools.

## 📊 Key Features

| Feature | Description | Default Threshold |
|---------|-------------|-------------------|
| 🌿 **Stale Branch Detection** | Identify branches untouched for extended periods | >30 days |
| 🔄 **Old PR Tracking** | Find pull requests awaiting review/merge | >14 days |
| 📋 **Unresponsive Issues** | Flag issues needing attention | >7 days |
| 🔒 **Security Alert Monitoring** | Track potential security concerns | Real-time |
| 🎯 **MCP Native** | Full MCP Resources & Tools integration | — |
| ⚡ **Configurable** | Customize thresholds and behavior | Flexible |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or compatible package manager
- GitHub Personal Access Token (optional but recommended for higher rate limits)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/IN3PIRE/github-health-monitor.git
cd github-health-monitor

# Install dependencies
npm install

# Build the project
npm run build

# Optional: Test the build
npm test
```

### Testing Your Installation

```bash
# Run in development mode
npm run dev

# Or start the built version
npm start
```

## 🔧 Configuration

### Environment Variables

Configure behavior using these environment variables:

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
      "args": ["/absolute/path/to/github-health-monitor/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GH_TOKEN}",
        "STALE_BRANCH_DAYS": "21"
      }
    }
  }
}
```

#### Popular MCP Clients
- **Claude Desktop**: Add to `claude_desktop_config.json`
- **Cursor**: Use MCP settings panel
- **Windsurf**: Configure via MCP integrations
- **Custom Applications**: Use MCP SDK directly

See the `examples/` directory for ready-to-use configuration templates.

## 📖 Usage Guide

### As an MCP Tool

Trigger comprehensive health checks for any repository:

```javascript
// Basic repository check
const healthReport = await mcpClient.callTool("check_health", {
  owner: "facebook",
  repo: "react"
});

// With custom thresholds for this specific check
const strictHealth = await mcpClient.callTool("check_health", {
  owner: "vercel",
  repo: "next.js",
  staleBranchDays: 14,
  oldPRDays: 7,
  unresponsiveIssueDays: 3
});
```

**Tool Parameters:**
- `owner` (string, required): GitHub username or organization
- `repo` (string, required): Repository name
- `staleBranchDays` (number, optional): Override default stale threshold
- `oldPRDays` (number, optional): Override PR age threshold
- `unresponsiveIssueDays` (number, optional): Override issue timeout

### As an MCP Resource

Read the current aggregated health metrics:

```javascript
// Access latest health snapshot
const metrics = await mcpClient.readResource("health://current");

// Integrate with monitoring dashboards
const healthData = await mcpClient.readResource("health://metrics");
```

**Available Resources:**
- `health://current`: Real-time repository health snapshot
- `health://metrics`: Time-series health metrics
- `health://summary`: Condensed health report

### Direct API Usage

For programmatic integration without MCP:

```bash
# Build the server
npm run build

# Run directly with environment variables
GITHUB_TOKEN=ghp_xxx node dist/index.js

# Use with process managers
pm2 start dist/index.js --name "github-health-monitor"
```

## 📈 Example Outputs

### Full Health Report

```json
{
  "repository": "facebook/react",
  "timestamp": "2024-03-20T15:30:00Z",
  "staleBranches": [
    {
      "name": "feature/deprecated-component",
      "lastCommit": "2024-01-15T10:30:00Z",
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
      "createdAt": "2024-02-20T08:15:00Z",
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
      "createdAt": "2024-02-10T14:22:00Z",
      "lastUpdated": "2024-02-10T14:22:00Z",
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

### Condensed Summary

```json
{
  "repository": "vercel/next.js",
  "healthScore": 85,
  "status": "healthy",
  "requiresAttention": {
    "staleBranches": 2,
    "oldPRs": 3,
    "unresponsiveIssues": 5
  },
  "timestamp": "2024-03-20T15:30:00Z"
}
```

## 🎯 Use Cases

### For Maintainers & Teams
- **Daily Standups**: Quick health pulse before meetings
- **Release Readiness**: Ensure no blockers before shipping
- **Cleanup Campaigns**: Identify technical debt systematically
- **Security Audits**: Monitor for new vulnerabilities
- **Onboarding**: Help new contributors understand repository state

### For Automation
- **CI/CD Integration**: Gate deployments on health thresholds
- **Scheduled Reports**: Daily/weekly health digests via automation
- **ChatOps**: Query repository health from Slack/Discord bots
- **Dashboards**: Feed metrics to Grafana, Datadog, etc.

## 🔍 Troubleshooting

### Common Issues

**Rate Limiting**
```
GitHub API rate limit exceeded. Retry after about 60 seconds. Set GITHUB_TOKEN for a higher request limit.
```
- **Solution**: Set `GITHUB_TOKEN` environment variable for 5,000 req/hour limit (vs 60 for unauthenticated)
- **Token**: Generate at [github.com/settings/tokens](https://github.com/settings/tokens) with `repo` scope
- **Behavior**: Short retry windows are retried with exponential backoff. Longer GitHub reset windows are returned as a clear health-check error with the retry time.

**Connection Issues**
```
Error: Failed to connect to MCP server
```
- Verify Node.js version: `node --version` (requires 20+)
- Check port availability: `lsof -i :<port>`
- Review firewall settings

**Permission Errors**
```
Error: Resource not accessible by integration
```
- Ensure token has access to target repository
- Verify repository name spelling
- Check organization access if applicable

### Debug Mode

```bash
# Enable verbose logging
DEBUG=mcp:* npm run dev

# Or set globally
export DEBUG=mcp:*
node dist/index.js
```

### Getting Help

1. Check existing [issues](https://github.com/IN3PIRE/github-health-monitor/issues)
2. Review logs with `DEBUG=mcp:*`
3. Verify configuration against examples in `examples/`
4. Open a new issue with debug logs and reproduction steps

## 🧪 Testing

```bash
# Run full test suite
npm test

# Run with coverage
npm test -- --coverage

# Lint check
npm run lint  # if configured
```

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   MCP Client    │◄────┤  MCP Protocol Layer  ├────►│  Health Monitor │
│ (Claude/Cursor) │     │  (SDK Integration)   │     │     Server      │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│    GitHub API   │◄────┤   Octokit Clients    │◄────┤   Metrics       │
│   (REST/GraphQL)│     │ (REST + GraphQL)     │     │   Engine        │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

### Core Components

- **MCP Server**: Handles protocol negotiation and tool/resource exposure
- **Metrics Engine**: Orchestrates data collection and analysis
- **GitHub Adapter**: Octokit-based API communication layer
- **Health Calculator**: Scoring and status determination logic

## 🤝 Contributing Guidelines

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Steps

1. **Star the repo** ⭐ (required for PR merging)
2. Fork the repository
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Make your changes with tests
5. Commit with clear messages: `git commit -m "feat: add new metric type"`
6. Push to your fork: `git push origin feat/your-feature`
7. Open a Pull Request with detailed description

**⚠️ Important**: PRs can only be merged if you have ⭐ starred this repository!

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/YOUR_USERNAME/github-health-monitor.git
cd github-health-monitor

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests before committing
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright © 2024 IN3PIRE

## 🌟 Support & Community

- ⭐ **Star this repository** to show support and unlock PR merging capabilities
- 🐛 [Report bugs](https://github.com/IN3PIRE/github-health-monitor/issues) with detailed reproduction steps
- 💡 [Request features](https://github.com/IN3PIRE/github-health-monitor/discussions) via GitHub Discussions
- 💬 [Join discussions](https://github.com/IN3PIRE/github-health-monitor/discussions) about roadmap and improvements

### Watch for Releases

Click 👀 **Watch** → **Releases only** to get notified about new versions and security updates.

---

**Built with ❤️ for the MCP ecosystem.**

⭐ **Don't forget to star the repo to enable PR merging and show your support!**
