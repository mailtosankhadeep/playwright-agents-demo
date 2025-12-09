# Accessing Agents in This Repository

This guide explains how to access and use the custom agents available in this Playwright demo repository.

## Quick Answer

To access agents in this repo, you need:

1. **VS Code** with **GitHub Copilot** extension installed
2. Proper **VS Code settings** configured (already set up in `.vscode/settings.json`)
3. **Reload VS Code** to discover agents
4. **Use Copilot Chat** to interact with agents

## Prerequisites

Before you can access agents, ensure you have:

- ✅ **VS Code** installed (latest version recommended)
- ✅ **GitHub Copilot** extension installed and activated
- ✅ **Node.js 18+** installed
- ✅ Repository cloned locally
- ✅ Dependencies installed: `npm install`
- ✅ Playwright browsers installed: `npx playwright install`

## Step-by-Step: Enabling Agents

### 1. Verify VS Code Settings

The repository already includes `.vscode/settings.json` with the required configuration:

```json
{
  "chat.agent.enabled": true,
  "github.copilot.chat.agents.enabled": true,
  "chat.modeFilesLocations": {
    ".github/agents": true
  },
  "chat.useAgentsMdFile": true,
  "chat.useNestedAgentsMdFiles": true,
  "chat.commandCenter.enabled": true
}
```

✨ **These settings tell VS Code to look for custom agents in the `.github/agents/` directory.**

### 2. Reload VS Code

After cloning the repository:

1. Open VS Code Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type and select: **"Developer: Reload Window"**
3. Wait for VS Code to restart

This ensures Copilot discovers the custom agents.

### 3. Verify Agents Are Available

Open GitHub Copilot Chat in VS Code:
- Click the chat icon in the activity bar, OR
- Use keyboard shortcut: `Ctrl+Alt+I` (Windows/Linux) or `Cmd+Alt+I` (Mac)

In the chat input, type `@` and you should see available agents in the dropdown.

## Available Agents

This repository includes three custom agents:

### 🏢 Agent HQ
**Purpose**: Central command center for orchestrating all Playwright agents and workflows

**When to use**: 
- You need help choosing the right agent
- You want to orchestrate multi-agent workflows
- You want test suite status and monitoring

**Example invocations**:
```
@Agent-HQ I need to test our new checkout flow
@Agent-HQ Show me Agent HQ status
@Agent-HQ What testing agents are available?
```

### 🎨 Test Designer
**Purpose**: Converts Jira user stories to BDD scenarios and Playwright tests

**When to use**:
- Converting Jira stories to automated tests
- Creating BDD scenarios from requirements
- Maintaining traceability between Jira and tests

**Prerequisites**:
- Jira environment variables configured (see README)

**Example invocations**:
```
@Test-Designer Convert Jira story SCRUM-15 to tests
@Test-Designer Create BDD scenarios from DS-10
```

### 📝 my-agent
**Purpose**: Example/template agent demonstrating agent structure

**When to use**:
- Learning how to create custom agents
- Understanding agent frontmatter and structure

## How to Invoke Agents

### Method 1: Direct Chat Invocation

In GitHub Copilot Chat, use the `@` mention:

```
@Agent-HQ [your request]
@Test-Designer [your request]
```

### Method 2: Natural Language (via Agent HQ)

You can also ask Agent HQ to route your request:

```
Agent HQ, I need to test the login page
Convert Jira story ABC-123 to tests
Fix all failing Playwright tests
```

### Method 3: GitHub Issues

You can assign work to agents through GitHub issues:

1. **Using labels**: Add labels like `agent-hq`, `test-automation`, `playwright`, or `e2e-testing`
2. **Using mentions**: Mention `@agent-hq` in issue descriptions or comments
3. **Using hashtags**: Include `#agent-hq` in issue text

### Method 4: GitHub Pull Requests

Agents can review and work on PRs:

1. Tag PRs with agent labels (e.g., `agent-hq`)
2. Mention agents in PR descriptions
3. Use hashtags in PR comments (e.g., `#agent-hq please review tests`)

## Chat Modes vs Custom Agents

This repository has both **chat modes** and **custom agents**:

### Chat Modes (in `.github/chatmodes/`)
- 🎭 **Planner**: Creates test plans by exploring web apps
- 🎭 **Generator**: Creates Playwright tests from plans
- 🎭 **Healer**: Debugs and fixes failing tests

**Access**: Invoked by Agent HQ or Test Designer as part of workflows

### Custom Agents (in `.github/agents/`)
- 🏢 **Agent HQ**: Orchestrator that uses chat modes
- 🎨 **Test Designer**: Jira-to-test converter
- 📝 **my-agent**: Example template

**Access**: Direct invocation via `@mention` in Copilot Chat

## Common Workflows

### Testing a New Feature
```
@Agent-HQ I need to test the registration form at https://myapp.com/register
```
Agent HQ will:
1. Route to Planner to explore and create scenarios
2. Route to Generator to implement tests
3. Route to Healer if any tests fail
4. Report final status

### Converting Jira to Tests
```
@Test-Designer Convert Jira story SCRUM-15 to automated tests
```
Test Designer will:
1. Fetch the Jira story
2. Create BDD scenarios in `feature/`
3. Generate step definitions in `step-definition/`
4. Run tests and fix if needed

### Getting Help
```
@Agent-HQ What agents are available?
@Agent-HQ Show me recent agent activities
```

## Troubleshooting

### Problem: Agents Don't Appear in Chat

**Solutions**:
1. Ensure GitHub Copilot extension is installed and activated
2. Verify `.vscode/settings.json` exists with correct configuration
3. Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
4. Check that agent files exist in `.github/agents/`
5. Ensure agent files have `.agent.md` extension

### Problem: "Agent Not Found" Error

**Solutions**:
1. Use exact agent name from frontmatter (e.g., `@Agent-HQ`, not `@agent-hq`)
2. Check agent file has proper YAML frontmatter with `name:` field
3. Reload VS Code after any changes to agent files

### Problem: Jira Integration Not Working

**Solutions**:
1. Create `.env` file with Jira credentials:
   ```
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=your.email@example.com
   JIRA_API_TOKEN=your_api_token
   ```
2. Verify MCP server is configured in `.vscode/mcp.json`
3. Check Jira credentials have correct permissions

### Problem: Chat Modes Not Available

**Solutions**:
1. Install Playwright agents: `npx playwright init-agents --loop=vscode`
2. Verify files exist in `.github/chatmodes/`:
   - `🎭 planner.chatmode.md`
   - `🎭 generator.chatmode.md`
   - `🎭 healer.chatmode.md`
3. Reload VS Code

### Problem: Playwright Tests Won't Run

**Solutions**:
1. Install dependencies: `npm install`
2. Install browsers: `npx playwright install`
3. Verify MCP server is configured in `.vscode/mcp.json`

## Additional Resources

- **[README.md](README.md)**: Project overview and setup
- **[Agent HQ Guide](docs/agent-hq-guide.md)**: Detailed Agent HQ usage examples
- **[Agent HQ Monitoring](docs/agent-hq-monitoring.md)**: Monitor agent activities
- **[.github/agents/](./github/agents/)**: Custom agent source files

## Creating Your Own Agents

Want to create custom agents? See **[my-agent.agent.md](.github/agents/my-agent.agent.md)** for a template with:

- YAML frontmatter structure
- Required and optional fields
- Tool configuration
- Operating procedures
- Communication style guidelines

## Quick Reference Card

| To Do This... | Use This Agent | Example |
|---------------|----------------|---------|
| Get help choosing an agent | Agent HQ | `@Agent-HQ What agents are available?` |
| Test a new feature end-to-end | Agent HQ | `@Agent-HQ Test the login at myapp.com` |
| Convert Jira story to tests | Test Designer | `@Test-Designer Convert SCRUM-15` |
| Check system status | Agent HQ | `@Agent-HQ Show me Agent HQ status` |
| Fix all failing tests | Agent HQ | `@Agent-HQ Fix all failing tests` |
| Monitor agent activities | Agent HQ | `@Agent-HQ Show recent workflows` |

## Support

If you encounter issues not covered in this guide:

1. Check [GitHub Issues](https://github.com/mailtosankhadeep/playwright-agents-demo/issues)
2. Review VS Code and Copilot extension logs
3. Verify all prerequisites are installed
4. Try the examples in [Agent HQ Guide](docs/agent-hq-guide.md)

---

**Ready to start?** Open Copilot Chat (`Ctrl+Alt+I` / `Cmd+Alt+I`) and type:
```
@Agent-HQ Hello! What can you help me with?
```
