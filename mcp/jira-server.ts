import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

interface JiraConfig {
  baseUrl: string;
  email: string;
  token: string;
  authHeader: string;
}

type FetchOptions = NonNullable<Parameters<typeof fetch>[1]>;

enum HttpMethod {
  GET = 'GET',
}

const server = new McpServer({
  name: 'jira-mcp-server',
  version: '0.1.0',
});

function loadConfig(): JiraConfig {
  // Allow dotenv to populate values; treat empty strings as missing.
  const rawBase = process.env.JIRA_BASE_URL;
  const rawEmail = process.env.JIRA_EMAIL;
  const rawToken = process.env.JIRA_API_TOKEN;

  const baseUrl = (rawBase && rawBase.trim()) ? rawBase.trim().replace(/\/$/, '') : '';
  const email = (rawEmail && rawEmail.trim()) ? rawEmail.trim() : '';
  const token = (rawToken && rawToken.trim()) ? rawToken.trim() : '';

  const missing: string[] = [];
  if (!baseUrl) missing.push('JIRA_BASE_URL');
  if (!email) missing.push('JIRA_EMAIL');
  if (!token) missing.push('JIRA_API_TOKEN');
  if (missing.length) {
    throw new Error(`Missing required Jira env vars: ${missing.join(', ')}. Ensure they are set in .env or your shell.`);
  }

  return {
    baseUrl,
    email,
    token,
    authHeader: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
  };
}

const jiraConfig = loadConfig();

async function jiraRequest(path: string, init: FetchOptions = {}): Promise<any> {
  const url = path.startsWith('http') ? new URL(path) : new URL(path.replace(/^\/+/, ''), `${jiraConfig.baseUrl}/`);
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Authorization', jiraConfig.authHeader);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch (jsonError) {
      errorBody = await response.text();
    }
    throw new Error(
      `Jira request failed with status ${response.status}: ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// --- Atlassian Cloud Helpers -------------------------------------------------
// Some issues may not be searchable via the site REST API (indexing delays, permission nuances).
// Atlassian recommends using the cloud "ex/jira/{cloudId}" endpoints. We discover cloudId once and cache.

let cachedCloudId: string | null = null;

async function resolveCloudId(): Promise<string | null> {
  if (cachedCloudId) return cachedCloudId;
  // Accessible resources endpoint: returns list of Jira sites
  const url = 'https://api.atlassian.com/oauth/token/accessible-resources';
  try {
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Authorization', jiraConfig.authHeader);
    const resp = await fetch(url, { headers });
    if (!resp.ok) return null;
    const data: any[] = await resp.json();
    // Match by baseUrl host or exact url
    const baseHost = new URL(jiraConfig.baseUrl).host;
    const match = data.find(r => r.url && new URL(r.url).host === baseHost) || data[0];
    if (match && match.id) {
      cachedCloudId = match.id;
      return cachedCloudId;
    }
    return null;
  } catch {
    return null;
  }
}

async function cloudRequest(path: string, init: FetchOptions = {}): Promise<any> {
  const cloudId = await resolveCloudId();
  if (!cloudId) {
    // Fallback to site request if cloudId cannot be resolved.
    return jiraRequest(path, init);
  }
  const base = `https://api.atlassian.com/ex/jira/${cloudId}`;
  const url = path.startsWith('http') ? new URL(path) : new URL(path.replace(/^\/+(ex\/jira\/[^/]+\/)?/, ''), `${base}/`);
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Authorization', jiraConfig.authHeader);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    let errorBody: unknown;
    try { errorBody = await response.json(); } catch { errorBody = await response.text(); }
    throw new Error(`Cloud Jira request failed ${response.status}: ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

server.registerTool(
  'jira.search',
  {
    title: 'Search Jira issues',
    description: 'Run a JQL query against Jira.',
    inputSchema: z.object({
      jql: z.string().min(1, 'JQL query is required'),
      fields: z.array(z.string()).optional(),
      expand: z.array(z.string()).optional(),
      maxResults: z.number().int().min(1).max(100).optional(),
      startAt: z.number().int().min(0).optional(),
    }),
  },
  async ({ jql, fields, expand, maxResults, startAt }) => {
    const searchParams = new URLSearchParams({ jql });
    if (fields?.length) {
      searchParams.set('fields', fields.join(','));
    }
    if (expand?.length) {
      searchParams.set('expand', expand.join(','));
    }
    if (typeof maxResults === 'number') {
      searchParams.set('maxResults', String(maxResults));
    }
    if (typeof startAt === 'number') {
      searchParams.set('startAt', String(startAt));
    }
    // Use direct site request - /rest/api/3/search endpoint
    const data = await jiraRequest(`/rest/api/3/search?${searchParams.toString()}`, { method: HttpMethod.GET });
    const total = typeof data?.total === 'number' ? data.total : 'unknown';
    const returned = Array.isArray(data?.issues) ? data.issues.length : 0;

    return {
      content: [
        {
          type: 'text',
          text: `Search returned ${returned} issues (total ${total}).`,
        },
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
      structuredContent: data,
    };
  }
);

server.registerTool(
  'jira.get',
  {
    title: 'Get Jira issue',
    description: 'Retrieve a Jira issue by key.',
    inputSchema: z.object({
      issueKey: z.string().min(1, 'Issue key is required'),
      fields: z.array(z.string()).optional(),
      expand: z.array(z.string()).optional(),
    }),
  },
  async ({ issueKey, fields, expand }) => {
    const params = new URLSearchParams();
    if (fields?.length) {
      params.set('fields', fields.join(','));
    }
    if (expand?.length) {
      params.set('expand', expand.join(','));
    }

    const query = params.toString();
    // Use direct site request
    const data = await jiraRequest(`/rest/api/3/issue/${encodeURIComponent(issueKey)}${query ? `?${query}` : ''}`, { method: HttpMethod.GET });

    const summary = data?.fields?.summary ? String(data.fields.summary) : 'No summary';

    return {
      content: [
        {
          type: 'text',
          text: `Fetched issue ${issueKey}: ${summary}`,
        },
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
      structuredContent: data,
    };
  }
);

export async function start(): Promise<void> {
  const transport = new StdioServerTransport();
  // connect() starts the transport; calling start() again causes 'already started' error.
  await server.connect(transport);
  console.log('[jira-mcp] Server started. Tools available: jira.search, jira.get');
}

if (require.main === module) {
  start().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to start Jira MCP server: ${message}`);
    process.exitCode = 1;
  });
}
