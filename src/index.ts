#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { collectHealthData } from './health-monitor.js';
import { formatGitHubApiError } from './github-rate-limit.js';
import { getConfig, formatHealthSummary } from './utils.js';

const server = new Server(
  {
    name: 'github-health-monitor',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'check_health',
        description: 'Check health metrics for a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (username or organization)'
            },
            repo: {
              type: 'string',
              description: 'Repository name'
            }
          },
          required: ['owner', 'repo']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'check_health') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const { owner, repo } = request.params.arguments as { owner: string; repo: string };
  
  if (!owner || !repo) {
    throw new Error('Missing required parameters: owner and repo are required');
  }

  try {
    const config = getConfig();
    const health = await collectHealthData(owner, repo, config);
    
    return {
      content: [
        {
          type: 'text',
          text: formatHealthSummary(health)
        },
        {
          type: 'text',
          text: JSON.stringify(health, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage = formatGitHubApiError(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error checking health for ${owner}/${repo}: ${errorMessage}`
        }
      ]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitHub Health Monitor MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
