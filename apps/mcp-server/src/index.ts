import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BlogApiClient } from './apiClient.js';
import { loadConfig } from './config.js';
import { loadMcpEnv } from './env.js';
import { registerBlogTools } from './tools/blog/registerBlogTools.js';

async function main() {
  loadMcpEnv();
  const config = loadConfig();
  const api = new BlogApiClient(config);

  const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion,
  });

  registerBlogTools(server, {
    api,
    allowBlogPublish: config.allowBlogPublish,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[mcp] ${config.serverName}@${config.serverVersion} connected over stdio`);
}

void main().catch((error) => {
  console.error('[mcp] failed to start server:', error);
  process.exit(1);
});
