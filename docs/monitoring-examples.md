# Agent HQ Monitoring Examples

Real-world examples of using Agent HQ monitoring to track and improve your testing workflows.

## Example 1: Basic Status Check

### Scenario
You want to check if Agent HQ is working properly before starting a large test generation project.

### Commands
```
User: "Show Agent HQ status"
```

### Expected Response
```
Agent HQ Status:
Health: idle
Active Workflows: 0
Total Workflows: 0
Agents Monitored: 0

{
  "timestamp": "2025-12-08T00:15:33.727Z",
  "agents": {},
  "workflows": {
    "total": 0,
    "inProgress": 0,
    "completed": 0,
    "failed": 0,
    "recentWorkflows": []
  },
  "health": "idle"
}
```

### What It Means
- **Health: idle** - No workflows currently running
- **Agents Monitored: 0** - No agents have been invoked yet (fresh start)
- System is ready for new work

---

## Example 2: Monitoring a Simple Workflow

### Scenario
You ask Agent HQ to create a test plan, and you want to see the activity.

### Commands
```
User: "Create a test plan for https://practice-automation.com"
[Wait for completion]
User: "Show recent agent activities"
```

### Expected Response
```
Recent activities (last 20):
Invocations: 1
Workflows: 1

{
  "invocations": [
    {
      "timestamp": "2025-12-08T00:16:45.123Z",
      "agent": "planner",
      "action": "create_test_plan",
      "status": "completed",
      "duration": 28.5,
      "context": {
        "url": "https://practice-automation.com"
      }
    }
  ],
  "workflows": [
    {
      "workflowId": "wf-001",
      "timestamp": "2025-12-08T00:16:15.000Z",
      "workflowType": "test-planning",
      "status": "completed",
      "agents": ["planner"],
      "duration": 30.2
    }
  ]
}
```

### What It Tells You
- Planner was invoked once
- Completed successfully in 28.5 seconds
- Workflow took 30.2 seconds total
- URL context was tracked

---

## Example 3: Multi-Agent Workflow Tracking

### Scenario
Converting a Jira story to tests involves multiple agents (Test Designer → Generator). Track the entire workflow.

### Commands
```
User: "Convert Jira story SCRUM-10 to tests"
[Wait for completion]
User: "Show recent activities"
User: "Show agent performance metrics"
```

### Expected Activities
```json
{
  "invocations": [
    {
      "timestamp": "2025-12-08T00:20:00.000Z",
      "agent": "testDesigner",
      "action": "fetch_jira_story",
      "status": "completed",
      "duration": 2.3
    },
    {
      "timestamp": "2025-12-08T00:20:03.000Z",
      "agent": "testDesigner",
      "action": "create_bdd_scenarios",
      "status": "completed",
      "duration": 5.1
    },
    {
      "timestamp": "2025-12-08T00:20:08.000Z",
      "agent": "generator",
      "action": "generate_step_definitions",
      "status": "completed",
      "duration": 45.2
    }
  ],
  "workflows": [
    {
      "workflowId": "wf-jira-scrum-10",
      "workflowType": "jira-to-test",
      "status": "completed",
      "agents": ["testDesigner", "generator"],
      "duration": 52.8
    }
  ]
}
```

### Expected Metrics
```json
{
  "testDesigner": {
    "totalInvocations": 2,
    "successful": 2,
    "failed": 0,
    "successRate": "100%",
    "avgDuration": "3.7s"
  },
  "generator": {
    "totalInvocations": 1,
    "successful": 1,
    "failed": 0,
    "successRate": "100%",
    "avgDuration": "45.2s"
  }
}
```

### Insights
- Test Designer handled two sub-tasks quickly (avg 3.7s)
- Generator took longer (45.2s) - normal for code generation
- 100% success rate - workflow is stable
- Total workflow time: 52.8 seconds

---

## Example 4: Debugging Failed Workflows

### Scenario
A workflow failed and you need to understand why.

### Commands
```
User: "Fix all my failing tests"
[Some failures occur]
User: "Show recent activities"
User: "Show metrics for the healer agent"
```

### Expected Activities (with failure)
```json
{
  "invocations": [
    {
      "timestamp": "2025-12-08T00:25:00.000Z",
      "agent": "healer",
      "action": "fix_test",
      "status": "failed",
      "duration": 120.5,
      "context": {
        "testFile": "user-login.spec.ts",
        "error": "Timeout waiting for selector"
      }
    },
    {
      "timestamp": "2025-12-08T00:27:05.000Z",
      "agent": "healer",
      "action": "fix_test",
      "status": "completed",
      "duration": 95.3,
      "context": {
        "testFile": "form-fields.spec.ts"
      }
    }
  ]
}
```

### Expected Healer Metrics
```json
{
  "healer": {
    "totalInvocations": 2,
    "successful": 1,
    "failed": 1,
    "successRate": "50%",
    "avgDuration": "107.9s"
  }
}
```

### Insights
- Healer succeeded on one test, failed on another
- Success rate of 50% indicates challenging fixes
- Failed test had selector timeout - may need manual review
- Average duration >100s suggests complex issues

### Next Steps
1. Review the failed test (`user-login.spec.ts`)
2. Check if selector changed in the application
3. May need to update test approach
4. Consider asking Agent HQ: "Help me fix user-login.spec.ts"

---

## Example 5: Performance Baseline Tracking

### Scenario
You want to establish performance baselines for your agents over a week.

### Daily Check Commands
```
# Monday
User: "Show agent performance metrics"

# Tuesday  
User: "Show agent performance metrics"

# ... continue daily ...

# Friday
User: "Show agent performance metrics"
```

### Week's Data Collection
```json
{
  "monday": {
    "planner": { "avgDuration": "28.5s", "successRate": "100%" },
    "generator": { "avgDuration": "67.2s", "successRate": "100%" }
  },
  "tuesday": {
    "planner": { "avgDuration": "31.2s", "successRate": "100%" },
    "generator": { "avgDuration": "72.8s", "successRate": "85%" }
  },
  "wednesday": {
    "planner": { "avgDuration": "29.1s", "successRate": "100%" },
    "generator": { "avgDuration": "145.3s", "successRate": "60%" }
  },
  "thursday": {
    "planner": { "avgDuration": "27.8s", "successRate": "100%" },
    "generator": { "avgDuration": "69.5s", "successRate": "90%" }
  },
  "friday": {
    "planner": { "avgDuration": "30.2s", "successRate": "100%" },
    "generator": { "avgDuration": "71.1s", "successRate": "95%" }
  }
}
```

### Analysis
- **Planner**: Consistent performance (27-31s), stable 100% success
- **Generator**: 
  - Normal range: 67-73s
  - Wednesday spike: 145s with 60% success - **ALERT**
  - Recovered Thursday/Friday
- **Action**: Investigate Wednesday's Generator issues

### Investigation
```
User: "Show all activities from Wednesday"
```

Might reveal:
- Larger than usual test generation request
- Network issues affecting MCP communication
- Complex page requiring more iterations

---

## Example 6: Monitoring During Development

### Scenario
You're developing new tests and want real-time feedback on agent performance.

### Workflow
```
# Start monitoring
User: "I'll be generating several tests, monitor Agent HQ activities"

# Generate tests
User: "Create a test for the login form"
User: "Create a test for the registration form"  
User: "Create a test for the checkout flow"

# Check progress
User: "What's the current Agent HQ status?"
User: "Show recent activities"
```

### Status During Active Work
```
Agent HQ Status:
Health: active
Active Workflows: 1
Total Workflows: 3

Recent activities show:
- 2 workflows completed
- 1 workflow in progress (checkout flow)
- Generator agent currently active
- Estimated completion: 45 seconds
```

### Completion Summary
```
Session Summary:
- 3 workflows executed
- 3 test files created
- Total time: 4 minutes 23 seconds
- All tests passing
- Average generation time: 87 seconds per test
```

---

## Example 7: Identifying Patterns in Failures

### Scenario
Multiple workflows failed over time. Identify common patterns.

### Commands
```
User: "Show all failed activities from the past week"
User: "What are common failure patterns?"
```

### Analysis Script
```bash
# Extract failed invocations
cat logs/agent-hq-invocations.log | \
  jq 'select(.status == "failed")' | \
  jq -s 'group_by(.agent) | map({agent: .[0].agent, failures: length, errors: map(.context.error)})'
```

### Example Output
```json
[
  {
    "agent": "healer",
    "failures": 5,
    "errors": [
      "Timeout waiting for selector",
      "Timeout waiting for selector",
      "Element not found",
      "Timeout waiting for selector",
      "Network error"
    ]
  },
  {
    "agent": "generator",
    "failures": 2,
    "errors": [
      "Invalid URL",
      "MCP timeout"
    ]
  }
]
```

### Insights
- **Healer**: 60% of failures are selector timeouts
  - Action: Review selector strategies
  - Consider increasing timeout values
- **Generator**: Rare failures, different causes
  - Invalid URL: User input validation needed
  - MCP timeout: Infrastructure issue, not agent issue

---

## Example 8: Creating a Health Dashboard

### Scenario
Create a daily monitoring report for your team.

### Commands
```
User: "Create a health dashboard for Agent HQ"
```

### Generated Dashboard
```markdown
# Agent HQ Health Dashboard
**Date**: 2025-12-08

## 🟢 System Status
- Overall Health: **Healthy**
- All Agents: **Operational**
- MCP Servers: **Connected**

## 📊 Today's Activity
| Metric | Value |
|--------|-------|
| Total Workflows | 15 |
| Successful | 13 (87%) |
| Failed | 2 (13%) |
| Tests Generated | 45 |
| Tests Healed | 8 |

## 🎯 Agent Performance
| Agent | Invocations | Success Rate | Avg Duration |
|-------|-------------|--------------|--------------|
| Planner | 6 | 100% | 29.3s |
| Generator | 9 | 89% | 71.5s |
| Healer | 8 | 75% | 98.2s |
| Test Designer | 3 | 100% | 156.8s |

## 🔥 Top Issues
1. **Healer selector timeouts** (3 occurrences)
   - Recommendation: Review timeout configurations
2. **Generator MCP timeout** (1 occurrence)
   - Recommendation: Check network stability

## 💡 Recommendations
- ✅ Overall performance is good
- ⚠️ Monitor Healer success rate (target: >80%)
- ✅ Test Designer performing exceptionally
- 📈 Consider caching for repeated patterns

## 📅 Week-over-Week
- Workflows: +12% ↗️
- Success Rate: -3% ↘️
- Avg Duration: +5% ↗️

**Action Items**:
1. Investigate recent success rate decrease
2. Optimize Healer selector strategies
3. Continue monitoring Generator performance
```

---

## Example 9: Automated Alerts

### Scenario
Set up monitoring to alert when performance degrades.

### Alert Rules
```bash
# Create alert script
cat > monitor-alerts.sh << 'EOF'
#!/bin/bash

# Read recent metrics
SUCCESS_RATE=$(cat logs/agent-hq-invocations.log | \
  jq -s 'map(select(.status == "completed")) | length' / \
  jq -s 'length' | bc -l)

# Alert if success rate < 80%
if (( $(echo "$SUCCESS_RATE < 0.8" | bc -l) )); then
  echo "ALERT: Success rate dropped to ${SUCCESS_RATE}%"
  # Send notification (email, Slack, etc.)
fi
EOF

chmod +x monitor-alerts.sh
```

### Cron Setup
```bash
# Run alerts every hour
crontab -e
# Add: 0 * * * * /path/to/monitor-alerts.sh
```

---

## Example 10: Integration with CI/CD

### Scenario
Include Agent HQ monitoring in your CI pipeline.

### GitHub Actions Workflow
```yaml
name: Agent HQ Health Check

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check Agent HQ Metrics
        run: |
          if [ -f logs/agent-hq-invocations.log ]; then
            TOTAL=$(cat logs/agent-hq-invocations.log | wc -l)
            FAILED=$(cat logs/agent-hq-invocations.log | grep '"status":"failed"' | wc -l)
            RATE=$(echo "scale=2; (1 - $FAILED / $TOTAL) * 100" | bc)
            
            echo "Success Rate: ${RATE}%"
            
            if (( $(echo "$RATE < 80" | bc -l) )); then
              echo "::error::Agent success rate below threshold: ${RATE}%"
              exit 1
            fi
          fi
      
      - name: Archive Logs
        uses: actions/upload-artifact@v3
        with:
          name: agent-hq-logs
          path: logs/
```

---

## Summary

These examples demonstrate:

1. **Basic Monitoring**: Status checks and activity viewing
2. **Workflow Tracking**: Multi-agent coordination monitoring
3. **Debugging**: Using monitoring to identify and fix issues
4. **Performance Analysis**: Establishing baselines and detecting anomalies
5. **Pattern Recognition**: Identifying common failure modes
6. **Reporting**: Creating dashboards and summaries
7. **Automation**: Setting up alerts and CI/CD integration

## Best Practices

1. **Check status before large operations**
2. **Monitor during development for immediate feedback**
3. **Review metrics regularly (weekly minimum)**
4. **Set up alerts for critical thresholds**
5. **Archive logs for long-term analysis**
6. **Share dashboards with your team**
7. **Act on insights - monitoring is only useful if you respond to what you learn**

## Next Steps

- Try these examples in your environment
- Customize dashboards for your team's needs
- Set up automated monitoring and alerts
- Integrate with your existing observability tools

For more information:
- [Complete Monitoring Guide](agent-hq-monitoring.md)
- [Quick Start Guide](monitoring-quickstart.md)
- [Agent HQ Usage Guide](agent-hq-guide.md)
