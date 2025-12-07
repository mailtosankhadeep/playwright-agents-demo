# Agent HQ Usage Guide

Agent HQ is your central command center for all Playwright testing operations. This guide shows you how to leverage Agent HQ to streamline your testing workflow.

## Quick Start

Simply mention Agent HQ in Copilot Chat with your testing need, and it will route you to the right agent or coordinate a multi-agent workflow.

## Common Use Cases

### 1. Testing a New Feature

**Scenario**: You've built a new user registration flow and want comprehensive test coverage.

**Ask Agent HQ**:
```
"I need to test our new registration form at https://myapp.com/register"
```

**What Agent HQ Does**:
1. Routes to **🎭 Planner** to explore the form and create test scenarios
2. Waits for test plan completion
3. Routes to **🎭 Generator** to implement the tests
4. Runs the generated tests
5. If any fail, routes to **🎭 Healer** to fix them
6. Reports final status with file locations

---

### 2. Converting Jira Stories to Tests

**Scenario**: Your team uses Jira to track features, and you want automated tests for each story.

**Ask Agent HQ**:
```
"Convert Jira story SCRUM-15 to automated tests"
```

**What Agent HQ Does**:
1. Verifies Jira configuration (environment variables)
2. Routes to **Test Designer** agent
3. Test Designer pulls the story, creates BDD scenarios, and generates step definitions
4. Monitors progress and handles any failures
5. Reports created files and test status

**Prerequisites**:
- `.env` file with Jira credentials (see README)

---

### 3. Fixing Failing Tests

**Scenario**: Your CI pipeline shows test failures, and you need them fixed quickly.

**Ask Agent HQ**:
```
"Fix all my failing Playwright tests"
```

**What Agent HQ Does**:
1. Lists all tests in the repository
2. Runs the test suite to identify failures
3. For each failing test, routes to **🎭 Healer**
4. Healer debugs and fixes each test systematically
5. Re-runs tests to verify fixes
6. Generates a health report

---

### 4. Just Planning (No Implementation)

**Scenario**: You want test scenarios documented but not automated yet.

**Ask Agent HQ**:
```
"Create a test plan for https://practice-automation.com"
```

**What Agent HQ Does**:
1. Routes directly to **🎭 Planner**
2. Planner explores the site and creates comprehensive scenarios
3. Saves the test plan as a markdown file
4. Reports the file location

---

### 5. Quick Test Generation

**Scenario**: You know exactly what you want to test and just need the code.

**Ask Agent HQ**:
```
"Create a test that logs in with user@test.com and password123, then verifies the dashboard loads"
```

**What Agent HQ Does**:
1. Recognizes this as a direct implementation request
2. Routes to **🎭 Generator**
3. Generator creates and validates the test
4. Reports the created test file

---

### 6. Understanding Available Agents

**Scenario**: You're new to the project and want to know what's available.

**Ask Agent HQ**:
```
"What agents are available?"
```

**What Agent HQ Does**:
1. Provides a catalog of all agents and chat modes
2. Explains what each one does
3. Shows example use cases
4. Helps you decide which to use

---

## Agent Routing Logic

Agent HQ intelligently routes your request based on keywords and intent:

| Your Request Contains | Routes To | Purpose |
|-----------------------|-----------|---------|
| "test plan", "scenarios" | 🎭 Planner | Design test cases |
| "create a test", "automate" | 🎭 Generator | Write test code |
| "fix", "failing", "broken" | 🎭 Healer | Debug tests |
| "Jira story", "SCRUM-" | Test Designer | Jira integration |
| "test X from scratch" | Multi-agent | Full workflow |

## Multi-Agent Workflows

Agent HQ excels at orchestrating complex workflows:

### End-to-End Testing Workflow
```
Plan → Generate → Heal → Report
```
1. Planner creates scenarios
2. Generator implements tests
3. Healer fixes any issues
4. Agent HQ reports results

### Jira-Driven Development
```
Jira → Test Designer → Done
```
1. Fetch Jira story
2. Convert to BDD scenarios
3. Generate step definitions (Test Designer orchestrates Generator internally)
4. Fix any issues (Test Designer uses Healer if needed)
5. Tests ready for CI

### Test Maintenance Sprint
```
List → Run → Analyze → Heal → Verify
```
1. List all tests
2. Run test suite
3. Identify patterns in failures
4. Route each failure to Healer
5. Verify all tests pass

## Configuration

Agent HQ works with your existing setup in `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright-test": {
      "type": "stdio",
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"]
    },
    "jira": {
      "type": "stdio",
      "command": "npx",
      "args": ["ts-node", "--transpile-only", "mcp/jira-server.ts"]
    }
  }
}
```

## Tips for Best Results

1. **Be Specific**: "Test the login form" vs "Create a test plan for the login at /login"
2. **Mention URLs**: Always include the URL when exploring new features
3. **Name Files**: "Save as user-login.spec.ts" helps Agent HQ organize output
4. **Trust the Process**: Agent HQ will update you as it coordinates multiple agents
5. **Iterate**: If results aren't perfect, ask for refinements

## Troubleshooting

### "Jira credentials not found"
**Solution**: Create a `.env` file with:
```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=your_api_token
```

### "Chat mode not found"
**Solution**: Install Playwright agents:
```bash
npx playwright init-agents --loop=vscode
```

### "MCP server not responding"
**Solution**: Reload VS Code window:
- Command Palette → "Developer: Reload Window"

## Advanced Usage

### Batch Processing Multiple Stories
```
"Convert Jira stories SCRUM-10 through SCRUM-15 to tests"
```

### Custom Workflows
```
"Create a test plan, then generate tests for the top 3 scenarios only"
```

### Specific Agent Selection
```
"Use the Healer agent to fix user-login.spec.ts"
```

## Next Steps

- Explore the [existing chatmodes](../.github/chatmodes/)
- Review the Test Designer agent in `.github/agents/Test Designer.agent.md`
- Check out [example BDD scenarios](../feature/)
- Try the interactive workflows above!

---

**Need Help?** Just ask Agent HQ: "How do I use Agent HQ?"
