# Agent HQ Monitoring Quick Start

Get started with monitoring Agent HQ in 5 minutes.

## Step 1: Verify Setup

The monitoring server is pre-configured. Check that it's in your MCP configuration:

```bash
# View MCP configuration
cat .vscode/mcp.json
```

You should see the `agent-hq-monitor` server listed.

## Step 2: Reload VS Code

After installation, reload VS Code to activate the monitoring server:

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Developer: Reload Window"
3. Press Enter

## Step 3: Check Status

In GitHub Copilot Chat, ask:

```
"Show Agent HQ status"
```

You should get a response showing:
- System health (idle/active)
- Number of workflows executed
- Agent availability
- Recent activities

## Step 4: Run a Workflow

Try a simple workflow to generate monitoring data:

```
"Create a test plan for https://practice-automation.com"
```

Agent HQ will route this to the Planner agent.

## Step 5: View Activity

After the workflow completes, check the activity:

```
"Show recent agent activities"
```

You'll see:
- Which agents were invoked
- When they ran
- Success/failure status
- Duration of each operation

## Step 6: Check Metrics

View performance metrics:

```
"Show agent performance metrics"
```

This displays:
- Total invocations per agent
- Success rates
- Average durations
- Error rates

## Common Monitoring Commands

### Status Checks
- `"What's the Agent HQ status?"`
- `"Is Agent HQ active?"`
- `"Show system health"`

### Activity History
- `"Show me the last 10 workflows"`
- `"What agents ran today?"`
- `"Display recent activities"`

### Performance
- `"How is the Planner performing?"`
- `"Show Generator success rate"`
- `"What's the average Healer duration?"`

### Specific Agent Metrics
- `"Show metrics for the Planner agent"`
- `"How many times was Generator invoked?"`
- `"What's Test Designer's success rate?"`

## Understanding the Output

### Status Response
```json
{
  "timestamp": "2025-12-08T00:15:33.727Z",
  "health": "idle",
  "workflows": {
    "total": 5,
    "inProgress": 0,
    "completed": 4,
    "failed": 1
  },
  "agents": {
    "planner": {
      "totalInvocations": 3,
      "successRate": "100%",
      "avgDuration": "28.5s"
    }
  }
}
```

### Metrics Response
```json
{
  "planner": {
    "totalInvocations": 3,
    "successful": 3,
    "failed": 0,
    "successRate": "100%",
    "avgDuration": "28.5s"
  },
  "generator": {
    "totalInvocations": 5,
    "successful": 4,
    "failed": 1,
    "successRate": "80%",
    "avgDuration": "67.2s"
  }
}
```

## Monitoring Log Files

Activity is logged to the `logs/` directory:

- `logs/agent-hq-workflows.log` - Workflow tracking
- `logs/agent-hq-invocations.log` - Agent invocations
- `logs/agent-hq-status.log` - Status checks

These are JSON log files that can be parsed by external tools.

## Troubleshooting

### "Monitoring server not responding"

**Solution**: Reload VS Code window
```
Command Palette → "Developer: Reload Window"
```

### "No monitoring data available"

**Reason**: No workflows have been executed yet.

**Solution**: Run a workflow first, then check status.

### "Logs directory not found"

**Reason**: Logs are created on first use.

**Solution**: Run any workflow—the logs directory will be created automatically.

### "Permission denied on logs directory"

**Solution**: Check file permissions
```bash
chmod 755 logs/
chmod 644 logs/*.log
```

## Advanced Usage

### View Raw Logs

```bash
# View all workflow logs
cat logs/agent-hq-workflows.log

# View recent invocations (last 20 lines)
tail -20 logs/agent-hq-invocations.log

# Watch logs in real-time
tail -f logs/agent-hq-invocations.log
```

### Parse Logs with jq

```bash
# Count workflows by status
cat logs/agent-hq-workflows.log | jq -s 'group_by(.status) | map({status: .[0].status, count: length})'

# Average duration by agent
cat logs/agent-hq-invocations.log | jq -s 'group_by(.agent) | map({agent: .[0].agent, avgDuration: (map(.duration) | add / length)})'
```

### Export Metrics

Create a monitoring dashboard:

```bash
# Export today's metrics
node -e "
const fs = require('fs');
const logs = fs.readFileSync('logs/agent-hq-invocations.log', 'utf-8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line))
  .filter(log => log.timestamp.startsWith('2025-12-08'));
console.log(JSON.stringify(logs, null, 2));
" > metrics-today.json
```

## Integration with CI/CD

Add monitoring to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Check Agent HQ Status
  run: |
    # Query status via GitHub Copilot or parse logs
    cat logs/agent-hq-workflows.log | jq -s 'map(select(.status == "failed")) | length'
```

## Best Practices

1. **Regular Status Checks**: Ask for status weekly
2. **Review Metrics Monthly**: Check performance trends
3. **Rotate Logs**: Archive old logs monthly
4. **Set Alerts**: Alert on >10% error rate
5. **Document Issues**: Note common failure patterns

## Next Steps

- Read the [complete monitoring guide](agent-hq-monitoring.md)
- Learn about [Agent HQ workflows](agent-hq-guide.md)
- Explore [custom monitoring scripts](#)

## Getting Help

If you encounter issues:

1. Check this quick start guide
2. Review the [detailed monitoring documentation](agent-hq-monitoring.md)
3. Ask Agent HQ: `"Help me with monitoring"`
4. Check MCP server logs in VS Code Output panel
