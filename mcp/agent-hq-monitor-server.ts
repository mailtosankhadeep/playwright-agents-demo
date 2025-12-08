import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

interface AgentActivity {
  timestamp: string;
  agent: string;
  action: string;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  context?: Record<string, any>;
}

interface WorkflowActivity {
  workflowId: string;
  timestamp: string;
  workflowType: string;
  status: 'started' | 'in-progress' | 'completed' | 'failed';
  agents: string[];
  duration?: number;
  context?: Record<string, any>;
}

const server = new McpServer({
  name: 'agent-hq-monitor-server',
  version: '0.1.0',
});

// Ensure logs directory exists
const LOGS_DIR = path.join(process.cwd(), 'logs');
const WORKFLOWS_LOG = path.join(LOGS_DIR, 'agent-hq-workflows.log');
const INVOCATIONS_LOG = path.join(LOGS_DIR, 'agent-hq-invocations.log');
const STATUS_LOG = path.join(LOGS_DIR, 'agent-hq-status.log');

function ensureLogsDirectory(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function appendToLog(logFile: string, entry: any): void {
  ensureLogsDirectory();
  const logLine = JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n';
  // Using sync operations for simplicity and to ensure logs are written before response
  // In high-load scenarios, consider switching to async operations with proper error handling
  fs.appendFileSync(logFile, logLine, 'utf-8');
}

function readLogFile(logFile: string, limit?: number): any[] {
  ensureLogsDirectory();
  if (!fs.existsSync(logFile)) {
    return [];
  }
  
  const content = fs.readFileSync(logFile, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  const entries = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (error) {
      // Skip malformed log lines - they may be from incomplete writes or corruption
      // Could add debug logging here if troubleshooting log parsing issues
      return null;
    }
  }).filter(entry => entry !== null);
  
  if (limit && limit > 0) {
    return entries.slice(-limit);
  }
  
  return entries;
}

function getAgentMetrics(): any {
  const invocations = readLogFile(INVOCATIONS_LOG);
  
  const metrics: Record<string, any> = {};
  
  invocations.forEach((inv: AgentActivity) => {
    const agent = inv.agent;
    if (!metrics[agent]) {
      metrics[agent] = {
        totalInvocations: 0,
        successful: 0,
        failed: 0,
        totalDuration: 0,
        avgDuration: 0,
      };
    }
    
    metrics[agent].totalInvocations++;
    if (inv.status === 'completed') {
      metrics[agent].successful++;
    } else if (inv.status === 'failed') {
      metrics[agent].failed++;
    }
    
    if (inv.duration) {
      metrics[agent].totalDuration += inv.duration;
    }
  });
  
  // Calculate averages and success rates
  Object.keys(metrics).forEach(agent => {
    const m = metrics[agent];
    m.successRate = m.totalInvocations > 0 
      ? ((m.successful / m.totalInvocations) * 100).toFixed(1) + '%'
      : '0%';
    m.avgDuration = m.totalInvocations > 0
      ? (m.totalDuration / m.totalInvocations).toFixed(1) + 's'
      : '0s';
  });
  
  return metrics;
}

function getWorkflowStatus(): any {
  const workflows = readLogFile(WORKFLOWS_LOG, 50);
  
  const inProgress = workflows.filter((w: WorkflowActivity) => 
    w.status === 'started' || w.status === 'in-progress'
  );
  
  const completed = workflows.filter((w: WorkflowActivity) => 
    w.status === 'completed'
  );
  
  const failed = workflows.filter((w: WorkflowActivity) => 
    w.status === 'failed'
  );
  
  return {
    total: workflows.length,
    inProgress: inProgress.length,
    completed: completed.length,
    failed: failed.length,
    recentWorkflows: workflows.slice(-10).reverse(),
  };
}

// Register monitoring tools
server.registerTool(
  'agentHQ.logActivity',
  {
    title: 'Log Agent Activity',
    description: 'Log an agent invocation or activity for monitoring purposes.',
    inputSchema: z.object({
      agent: z.string().min(1, 'Agent name is required'),
      action: z.string().min(1, 'Action is required'),
      status: z.enum(['started', 'completed', 'failed']),
      duration: z.number().optional(),
      context: z.record(z.any()).optional(),
    }),
  },
  async ({ agent, action, status, duration, context }) => {
    // Limit agent name and action length to prevent excessively large log entries
    const activity: AgentActivity = {
      timestamp: new Date().toISOString(),
      agent: agent.substring(0, 100),
      action: action.substring(0, 200),
      status,
      duration,
      // Limit context size - stringify and check length
      context: context ? JSON.parse(JSON.stringify(context).substring(0, 1000)) : undefined,
    };
    
    appendToLog(INVOCATIONS_LOG, activity);
    
    return {
      content: [
        {
          type: 'text',
          text: `Logged activity for ${agent}: ${action} (${status})`,
        },
      ],
    };
  }
);

server.registerTool(
  'agentHQ.logWorkflow',
  {
    title: 'Log Workflow Activity',
    description: 'Log a workflow execution for monitoring purposes.',
    inputSchema: z.object({
      workflowId: z.string().min(1, 'Workflow ID is required'),
      workflowType: z.string().min(1, 'Workflow type is required'),
      status: z.enum(['started', 'in-progress', 'completed', 'failed']),
      agents: z.array(z.string()).optional(),
      duration: z.number().optional(),
      context: z.record(z.any()).optional(),
    }),
  },
  async ({ workflowId, workflowType, status, agents, duration, context }) => {
    // Limit field lengths to prevent excessively large log entries
    const workflow: WorkflowActivity = {
      workflowId: workflowId.substring(0, 100),
      timestamp: new Date().toISOString(),
      workflowType: workflowType.substring(0, 100),
      status,
      agents: (agents || []).slice(0, 20).map(a => a.substring(0, 100)),
      duration,
      // Limit context size
      context: context ? JSON.parse(JSON.stringify(context).substring(0, 1000)) : undefined,
    };
    
    appendToLog(WORKFLOWS_LOG, workflow);
    
    return {
      content: [
        {
          type: 'text',
          text: `Logged workflow: ${workflowType} (${workflowId}) - ${status}`,
        },
      ],
    };
  }
);

server.registerTool(
  'agentHQ.getStatus',
  {
    title: 'Get Agent HQ Status',
    description: 'Retrieve current status of Agent HQ, including active workflows and agent health.',
    inputSchema: z.object({}),
  },
  async () => {
    const agentMetrics = getAgentMetrics();
    const workflowStatus = getWorkflowStatus();
    
    const status = {
      timestamp: new Date().toISOString(),
      agents: agentMetrics,
      workflows: workflowStatus,
      health: workflowStatus.inProgress > 0 ? 'active' : 'idle',
    };
    
    appendToLog(STATUS_LOG, { type: 'status_check', ...status });
    
    const summary = `Agent HQ Status:
Health: ${status.health}
Active Workflows: ${workflowStatus.inProgress}
Total Workflows: ${workflowStatus.total}
Agents Monitored: ${Object.keys(agentMetrics).length}`;
    
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
      structuredContent: status,
    };
  }
);

server.registerTool(
  'agentHQ.getMetrics',
  {
    title: 'Get Agent Metrics',
    description: 'Retrieve performance metrics for all agents.',
    inputSchema: z.object({
      agent: z.string().optional(),
    }),
  },
  async ({ agent }) => {
    const allMetrics = getAgentMetrics();
    
    const metrics = agent ? { [agent]: allMetrics[agent] || {} } : allMetrics;
    
    const summary = agent
      ? `Metrics for ${agent}:\n${JSON.stringify(metrics[agent], null, 2)}`
      : `Metrics for ${Object.keys(metrics).length} agents`;
    
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
        {
          type: 'text',
          text: JSON.stringify(metrics, null, 2),
        },
      ],
      structuredContent: metrics,
    };
  }
);

server.registerTool(
  'agentHQ.getRecentActivities',
  {
    title: 'Get Recent Activities',
    description: 'Retrieve recent agent invocations and workflow activities.',
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      type: z.enum(['invocations', 'workflows', 'all']).optional(),
    }),
  },
  async ({ limit = 20, type = 'all' }) => {
    const activities: any = {};
    
    if (type === 'invocations' || type === 'all') {
      activities.invocations = readLogFile(INVOCATIONS_LOG, limit);
    }
    
    if (type === 'workflows' || type === 'all') {
      activities.workflows = readLogFile(WORKFLOWS_LOG, limit);
    }
    
    const summary = `Recent activities (last ${limit}):
Invocations: ${activities.invocations?.length || 0}
Workflows: ${activities.workflows?.length || 0}`;
    
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
        {
          type: 'text',
          text: JSON.stringify(activities, null, 2),
        },
      ],
      structuredContent: activities,
    };
  }
);

server.registerTool(
  'agentHQ.clearLogs',
  {
    title: 'Clear Monitoring Logs',
    description: 'Clear all monitoring logs (use with caution).',
    inputSchema: z.object({
      confirm: z.boolean(),
    }),
  },
  async ({ confirm }) => {
    if (!confirm) {
      return {
        content: [
          {
            type: 'text',
            text: 'Log clearing cancelled. Set confirm=true to proceed.',
          },
        ],
      };
    }
    
    ensureLogsDirectory();
    
    [WORKFLOWS_LOG, INVOCATIONS_LOG, STATUS_LOG].forEach(logFile => {
      if (fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '', 'utf-8');
      }
    });
    
    return {
      content: [
        {
          type: 'text',
          text: 'All monitoring logs have been cleared.',
        },
      ],
    };
  }
);

export async function start(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('[agent-hq-monitor] Server started. Tools available: agentHQ.logActivity, agentHQ.logWorkflow, agentHQ.getStatus, agentHQ.getMetrics, agentHQ.getRecentActivities, agentHQ.clearLogs');
}

if (require.main === module) {
  start().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to start Agent HQ Monitor server: ${message}`);
    process.exitCode = 1;
  });
}
