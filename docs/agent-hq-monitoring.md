# Agent HQ Monitoring Guide

This guide explains how to monitor and track Agent HQ activities, workflows, and performance.

## Overview

Agent HQ coordinates multiple agents and workflows. Monitoring helps you:
- Track which agents are being invoked
- Understand workflow execution paths
- Debug issues with agent coordination
- Measure agent performance and success rates
- Audit agent activities for compliance

## Monitoring Methods

### 1. Activity Logging

Agent HQ automatically logs its activities to help you understand what's happening during workflows.

#### Log Locations

- **Workflow logs**: `logs/agent-hq-workflows.log` - High-level workflow tracking
- **Agent invocations**: `logs/agent-hq-invocations.log` - Detailed agent calls
- **Status reports**: `logs/agent-hq-status.log` - Health checks and status updates

#### Log Format

```json
{
  "timestamp": "2025-12-08T00:15:33.727Z",
  "level": "info",
  "workflow": "plan-generate-heal",
  "agent": "planner",
  "action": "invoke",
  "status": "started",
  "context": {
    "url": "https://practice-automation.com",
    "feature": "form-fields"
  }
}
```

### 2. Status Dashboard

Query Agent HQ status at any time by asking:

```
"What's the current status of Agent HQ?"
"Show me recent agent activities"
"What workflows are running?"
```

Agent HQ will report:
- Active workflows
- Recently completed tasks
- Agent health status
- Queue of pending operations

### 3. Performance Metrics

Track agent performance by asking:

```
"Show agent performance metrics"
"How many tests have been generated today?"
"What's the success rate of the Healer agent?"
```

Metrics tracked:
- **Invocation count**: Number of times each agent was called
- **Success rate**: Percentage of successful agent completions
- **Average duration**: Time taken per agent invocation
- **Error rate**: Frequency of agent failures

### 4. Workflow Visualization

Understand complex multi-agent workflows:

```
"Visualize the last workflow"
"Show me how the Jira-to-test workflow works"
```

Agent HQ provides:
- Flow diagrams of agent coordination
- Timing information for each step
- Decision points and routing logic
- Error handling paths

## Monitoring Workflows

### Monitoring Active Workflows

While a workflow is running, check its status:

```
"What's the status of the current workflow?"
"Show progress of test generation"
```

Example output:
```
Workflow: Jira Story to Test (SCRUM-10)
Status: In Progress
Progress:
  ✅ Fetch Jira story - Completed (2.3s)
  ✅ Generate BDD scenarios - Completed (5.1s)
  ⏳ Generate step definitions - In Progress (3.5s elapsed)
  ⏸️ Run tests - Pending
  ⏸️ Heal failures - Pending
```

### Monitoring Past Workflows

Review completed workflows:

```
"Show me the last 5 workflows"
"What happened in workflow ABC123?"
"Show failed workflows from today"
```

## Real-Time Monitoring with MCP Tools

Agent HQ can be monitored programmatically using MCP tools.

### Available Monitoring Tools

Add these tools to Agent HQ's tool list in `.github/agents/Agent HQ.agent.md`:

```yaml
tools:
  # Existing tools...
  - filesystem.read   # Read log files
  - filesystem.write  # Write monitoring reports
```

### Reading Log Files

To check agent activity logs:

```typescript
// Agent HQ can read its own logs
const logs = await filesystem.read('logs/agent-hq-invocations.log');
// Parse and display recent activities
```

### Custom Status Checks

Create custom status check scripts in `mcp/`:

```typescript
// mcp/agent-hq-monitor.ts
export async function getAgentStatus() {
  // Read logs, parse metrics, return status
}
```

## Monitoring Best Practices

### 1. Regular Health Checks

Schedule periodic status checks:
- Ask Agent HQ for status daily
- Review error logs weekly
- Analyze performance metrics monthly

### 2. Alert Configuration

Set up alerts for:
- **High error rate**: >10% agent failures
- **Long-running workflows**: >10 minutes without completion
- **Blocked workflows**: Waiting for user input >30 minutes

### 3. Log Rotation

Prevent log files from growing too large:
- Rotate logs daily
- Keep last 30 days of logs
- Archive older logs to storage

### 4. Performance Baselines

Establish performance baselines:
- Typical Planner duration: 15-45 seconds
- Typical Generator duration: 30-90 seconds
- Typical Healer duration: 45-120 seconds

Alert when actual performance deviates >50% from baseline.

## Monitoring Jira Integration

When using Test Designer with Jira:

### Connection Health

```
"Check Jira connection status"
```

Reports:
- Jira API connectivity
- Authentication status
- Rate limit status
- Last successful request

### Story Processing

```
"Show Jira stories processed today"
"What's the status of SCRUM-10 conversion?"
```

Tracks:
- Stories fetched
- Stories converted to BDD
- Tests generated
- Tests passing

## Monitoring Playwright Tests

Agent HQ can monitor test suite health:

```
"Run a health check on all tests"
"Show test suite metrics"
```

Provides:
- Total tests count
- Passing/failing ratio
- Flaky test detection
- Test execution times

## Troubleshooting with Monitoring

### Problem: Agent Not Responding

**Check**:
```
"Show recent invocations of the Healer agent"
```

**Look for**:
- Timeout errors
- MCP server disconnections
- Missing chat mode files

### Problem: Workflow Stuck

**Check**:
```
"What workflow is currently running?"
"Show last logged action"
```

**Look for**:
- Waiting for user input
- External service timeouts
- Agent errors

### Problem: High Failure Rate

**Check**:
```
"Show agent error patterns"
"What are common failure reasons?"
```

**Look for**:
- Consistent error messages
- Environmental issues
- Configuration problems

## Monitoring Dashboard Example

Create a monitoring dashboard by asking:

```
"Create a monitoring dashboard for Agent HQ"
```

Agent HQ generates a markdown report:

```markdown
# Agent HQ Monitoring Dashboard
**Generated**: 2025-12-08 00:15:33

## System Status
- ✅ All agents available
- ✅ MCP servers connected
- ✅ Playwright installed
- ⚠️ Jira credentials not configured

## Today's Activity
- **Total workflows**: 12
- **Successful**: 10 (83%)
- **Failed**: 2 (17%)
- **Tests generated**: 45
- **Tests healed**: 8

## Agent Performance
| Agent | Invocations | Success Rate | Avg Duration |
|-------|-------------|--------------|--------------|
| Planner | 5 | 100% | 28s |
| Generator | 8 | 87.5% | 67s |
| Healer | 6 | 83% | 94s |
| Test Designer | 3 | 100% | 156s |

## Recent Workflows
1. ✅ SCRUM-10 to test (5 min ago)
2. ✅ Plan login flow (12 min ago)
3. ❌ Fix failing tests (18 min ago) - User cancelled
4. ✅ Generate form test (25 min ago)

## Alerts
- None

## Recommendations
- Configure Jira credentials for Test Designer
- Investigate Generator timeout on large features
```

## Advanced Monitoring

### Integration with External Tools

Export monitoring data to:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Splunk**: Log analysis
- **DataDog**: Full observability

### Custom Metrics

Define custom metrics:
```
"Track custom metric: average-scenarios-per-feature"
```

### Automated Reports

Schedule automatic reports:
```
"Send me a daily Agent HQ report"
"Alert me when error rate exceeds 15%"
```

## Monitoring API

For programmatic monitoring, Agent HQ exposes status via tools:

```typescript
// Check status
await agentHQ.getStatus();

// Get metrics
await agentHQ.getMetrics({
  timeRange: 'last-24h',
  agents: ['planner', 'generator']
});

// Query logs
await agentHQ.queryLogs({
  level: 'error',
  since: '2025-12-07T00:00:00Z'
});
```

## Privacy and Security

When monitoring:
- **Don't log sensitive data**: Passwords, API tokens, PII
- **Sanitize URLs**: Remove query parameters with secrets
- **Redact Jira content**: Don't log full story descriptions
- **Secure log files**: Set appropriate file permissions

## Compliance and Auditing

For compliance requirements:
- **Immutable logs**: Use append-only logging
- **Retention policies**: Keep logs for required duration
- **Audit trail**: Track who invoked which agents
- **Change tracking**: Log all file modifications

## Example Monitoring Session

```
User: "I want to monitor Agent HQ activities for the next workflow"

Agent HQ: "Monitoring enabled. I'll provide detailed logging for the next workflow.
What would you like to do?"

User: "Convert SCRUM-10 to tests"

Agent HQ: 
📊 Workflow: Jira Story to Test (SCRUM-10)
[00:00] ▶️ Starting workflow
[00:00] 📋 Verifying Jira configuration... ✅
[00:02] 🎨 Invoking Test Designer agent...
[00:15] ✅ Test Designer: Fetched SCRUM-10
[00:20] ✅ Test Designer: Created feature/SCRUM-10-auto.feature
[00:35] 🎭 Test Designer invoking Generator...
[01:20] ✅ Generator: Created step-definition/SCRUM-10.steps.ts
[01:25] 🧪 Running tests...
[01:35] ✅ All tests passing
[01:35] 📊 Workflow completed successfully

Summary:
- Duration: 95 seconds
- Agents invoked: Test Designer → Generator
- Files created: 2
- Tests: 3 scenarios, all passing
```

## Getting Help

For monitoring issues:
1. Check this guide for solutions
2. Review log files in `logs/`
3. Ask Agent HQ: "Help me debug monitoring"
4. Check MCP server status in VS Code

## Next Steps

- Set up log rotation with a cron job
- Configure alerts for critical failures
- Create a custom monitoring dashboard
- Export metrics to your observability platform
