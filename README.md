# GitHub Health Monitor MCP

An MCP (Model Context Protocol) server that monitors GitHub repository health metrics including stale branches, old PRs, unresponsive issues, and security alerts.

## 📊 Features

- **Stale Branch Detection** - Identify branches untouched for >30 days
- **Old PR Tracking** - Find pull requests open for >14 days  
- **Unresponsive Issues** - Flag issues without updates for >7 days
- **Security Alert Monitoring** - Track potential security concerns
- **MCP Resources** - Expose metrics via `health://current` resource
- **MCP Tools** - Trigger checks with `check_health` tool

## 🚀 Installation

```bash
# Clone and build
git clone https://github.com/IN3PIRE/github-health-monitor.git
cd github-health-monitor
npm install
npm run build

# Configure in MCP client
# Add to your MCP config:
{
  "mcpServers": {
    "github-health": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

## 🔧 Configuration

Set environment variables:
- `GITHUB_TOKEN` - For authenticated API requests (increases rate limits)
- `STALE_BRANCH_DAYS` - Customize stale branch threshold (default: 30)
- `OLD_PR_DAYS` - Customize old PR threshold (default: 14)
- `UNRESPONSIVE_ISSUE_DAYS` - Customize issue timeout (default: 7)

## 📖 Usage

### As MCP Tool
```javascript
// Trigger health check
const health = await mcpClient.callTool("check_health", {
  owner: "facebook",
  repo: "react"
});
```

### As MCP Resource  
```javascript
// Read current health metrics
const metrics = await mcpClient.readResource("health://current");
```

### Direct API
```bash
# Build and run
npm run build
node dist/index.js
```

## 🎯 Example Output

```json
{
  "staleBranches": [
    {
      "name": "feature/old-feature",
      "lastCommit": "2024-01-15T10:30:00Z",
      "daysStale": 45
    }
  ],
  "oldPRs": [
    {
      "number": 123,
      "title": "Add new feature",
      "daysOpen": 20,
      "author": "dev123"
    }
  ],
  "unresponsiveIssues": [
    {
      "number": 456,
      "title": "Bug: something broken",
      "daysSinceUpdate": 10,
      "assignee": "maintainer"
    }
  ],
  "securityAlerts": [],
  "timestamp": "2024-03-20T15:30:00Z"
}
```

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Important**: PRs can only be merged if you have ⭐ starred this repository!

## 📄 License

MIT License - see LICENSE file for details.

## 🌟 Support

If you find this useful, please ⭐ star the repository!