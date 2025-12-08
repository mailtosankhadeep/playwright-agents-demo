# Agent HQ Monitoring Logs

This directory contains monitoring logs for Agent HQ activities.

## Log Files

- `agent-hq-workflows.log` - High-level workflow tracking
- `agent-hq-invocations.log` - Detailed agent invocation records
- `agent-hq-status.log` - System status checks and health reports

## Log Format

Each log entry is a JSON object on a single line:

```json
{"timestamp":"2025-12-08T00:15:33.727Z","agent":"planner","action":"invoke","status":"completed","duration":28.5}
```

## Reading Logs

View recent activities:
```bash
tail -20 agent-hq-invocations.log
```

Watch logs in real-time:
```bash
tail -f agent-hq-invocations.log
```

Parse with jq:
```bash
cat agent-hq-invocations.log | jq -s 'group_by(.agent)'
```

## Log Rotation

Logs are not automatically rotated. Consider setting up log rotation:

```bash
# Rotate daily, keep 30 days
logrotate -d /path/to/logrotate.conf
```

## Documentation

See the [monitoring documentation](../docs/agent-hq-monitoring.md) for complete details.
