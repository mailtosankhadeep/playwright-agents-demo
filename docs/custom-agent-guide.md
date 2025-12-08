# Custom Agent Creation Guide

This guide explains how to create and edit custom agent files for GitHub Copilot to extend its capabilities with specialized workflows and tools.

## Overview

Custom agents are specialized assistants that extend GitHub Copilot's capabilities. They are defined using `.agent.md` files with YAML frontmatter configuration.

## File Location

Place your custom agent files in one of these locations:

### Workspace-Level (Recommended)
```
.github/agents/
```
- Agents are available to all users of the repository
- Version controlled with your project
- Shared across the team

### User Profile (Global)
```
~/.github/agents/  (Unix/Mac)
%USERPROFILE%/.github/agents/  (Windows)
```
- Available across all your repositories
- Personal agents for your own workflows
- Not shared with team members

## File Structure

Custom agent files must follow this structure:

```markdown
---
description: 'Brief one-line description of what this agent does'
delegation:
  accept_issues: true
  accept_pull_requests: true
  labels:
    - 'label-name'
  assignable_via:
    - github_issues
    - github_mentions
    - chat_commands
tools:
  - tool.name
  - another.tool
---

# Agent content in Markdown
Your agent's instructions, workflows, and documentation go here.
```

## YAML Frontmatter Reference

### Required Fields

#### `description`
A concise, single-line description of the agent's purpose.

**Example:**
```yaml
description: 'Converts Jira stories to BDD scenarios and generates Playwright tests'
```

#### `tools`
Array of tools and capabilities the agent can use.

**Common Tools:**
- **File Operations**: `filesystem.read`, `filesystem.write`, `filesystem.patch`
- **Playwright**: `playwright-test.browser_navigate`, `playwright-test.test_run`, `playwright-test.test_list`
- **Jira**: `jira.search`, `jira.get`
- **Chat Modes**: `chatmode.invoke.planner`, `chatmode.invoke.generator`, `chatmode.invoke.healer`
- **Monitoring**: `agentHQ.logActivity`, `agentHQ.getStatus`, `agentHQ.getMetrics`

**Example:**
```yaml
tools:
  - filesystem.read
  - filesystem.write
  - playwright-test.test_run
  - jira.search
```

### Optional Fields

#### `delegation`
Configuration for how the agent can be assigned work.

**Fields:**
- `accept_issues` (boolean): Whether the agent responds to GitHub issues
- `accept_pull_requests` (boolean): Whether the agent responds to pull requests
- `labels` (array): GitHub labels that trigger this agent
- `assignable_via` (array): Methods to invoke the agent

**Example:**
```yaml
delegation:
  accept_issues: true
  accept_pull_requests: true
  labels:
    - 'test-automation'
    - 'e2e-testing'
  assignable_via:
    - github_issues
    - github_mentions
    - chat_commands
```

## Agent Content (Markdown)

After the YAML frontmatter separator (`---`), write the agent's instructions in Markdown.

### Recommended Sections

#### 1. Mission
Clearly state the agent's primary purpose and goals.

```markdown
## Mission
This agent converts Jira user stories into BDD scenarios and generates 
Playwright test code using the Generator chat mode.
```

#### 2. Prerequisites
List what must be in place before the agent can operate.

```markdown
## Prerequisites
- Environment variables: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
- Playwright browsers installed: `npx playwright install`
- Chat modes installed: `npx playwright init-agents --loop=vscode`
```

#### 3. Operating Procedure
Document step-by-step how the agent works.

```markdown
## Operating Procedure
1. Verify Jira connectivity using `jira.search`
2. Fetch the specified user story with `jira.get`
3. Extract acceptance criteria from the story
4. Generate BDD scenarios in Gherkin format
5. Invoke Generator chat mode to create tests
6. Report results with file paths
```

#### 4. Workflows
Provide examples of typical usage patterns.

```markdown
## Example Workflows

### Convert Single Story
User: "Convert JIRA-123 to tests"
Agent:
1. Fetch story JIRA-123
2. Parse acceptance criteria
3. Create feature file
4. Generate step definitions
5. Report completion
```

#### 5. Communication Style
Define how the agent communicates.

```markdown
## Communication Style
- Be concise and action-oriented
- Report progress at each major step
- Include file paths in summaries
- Ask for clarification when requirements are ambiguous
```

#### 6. Safeguards
List important constraints and protections.

```markdown
## Safeguards
- Never modify files without user consent
- Verify prerequisites before starting workflows
- Handle API rate limits gracefully
- Don't proceed if credentials are missing
```

#### 7. Escalation
Define when to ask for help.

```markdown
## Escalation
- Ask users for clarification when requirements are unclear
- Request missing configuration (API keys, URLs)
- Report when external services are unavailable
```

## Complete Example

Here's a complete example of a custom agent file:

```markdown
---
description: 'Analyzes test coverage and suggests missing test scenarios'
delegation:
  accept_issues: true
  accept_pull_requests: false
  labels:
    - 'test-coverage'
    - 'quality-assurance'
  assignable_via:
    - github_issues
    - chat_commands
tools:
  - filesystem.read
  - playwright-test.test_list
  - playwright-test.test_run
---

## Mission
Analyze existing Playwright test coverage and identify gaps in test scenarios.
Suggest new test cases based on application structure and user flows.

## Prerequisites
- Playwright tests exist in the repository
- Playwright browsers are installed
- Tests can be listed using `test_list`

## Operating Procedure
1. List all existing Playwright tests using `test_list`
2. Analyze test names and file structure
3. Read application code to understand features
4. Identify untested user flows and edge cases
5. Generate recommendations for new tests
6. Optionally create test stubs if requested

## Example Workflow

### Coverage Analysis
User: "Check my test coverage for the checkout flow"
Agent:
1. List all tests containing "checkout"
2. Read checkout implementation files
3. Compare implementation features vs test coverage
4. Report gaps: "Missing tests for discount codes, guest checkout"
5. Suggest specific test scenarios to add

## Communication Style
- Start with a summary of current coverage
- Present gaps as actionable recommendations
- Include specific file paths and line numbers
- Offer to generate test stubs if useful

## Safeguards
- Only suggest tests that align with existing patterns
- Don't criticize existing tests
- Respect project testing conventions
- Ask before generating new files

## Escalation
- Ask which area to focus on if the codebase is large
- Request clarification on business rules if unclear
- Suggest consulting documentation for complex flows
```

## Creating Your First Agent

### Step 1: Create the File
Create a new file in `.github/agents/` with a descriptive name ending in `.agent.md`:

```bash
touch .github/agents/MySpecializedAgent.agent.md
```

### Step 2: Add YAML Frontmatter
Start with the YAML configuration:

```yaml
---
description: 'Your agent description'
tools:
  - filesystem.read
  - filesystem.write
---
```

### Step 3: Write Agent Instructions
Add Markdown content explaining:
- What the agent does (Mission)
- How it operates (Operating Procedure)
- Example workflows
- Safeguards and escalation rules

### Step 4: Test the Agent
1. Reload VS Code: Command Palette → `Developer: Reload Window`
2. Open Copilot Chat
3. Mention your agent or use its configured labels
4. Test with a simple request

## Best Practices

### 1. Be Specific
- Write clear, unambiguous instructions
- Provide concrete examples
- Define success criteria

### 2. Handle Errors Gracefully
- Check prerequisites before starting
- Validate inputs
- Provide helpful error messages

### 3. Make It Discoverable
- Use descriptive names for agent files
- Add relevant labels in delegation config
- Document in your repository README

### 4. Follow Conventions
- Match existing agent patterns in your project
- Use consistent terminology
- Respect coding standards

### 5. Iterate and Improve
- Start simple and add complexity as needed
- Gather feedback from team members
- Update based on real-world usage

## Invoking Custom Agents

### From Chat
Simply mention the agent by name:
```
"MySpecializedAgent, please analyze the test coverage"
```

### From GitHub Issues
1. Add labels configured in the agent's `delegation.labels`
2. Or mention the agent in the issue description
3. Or use the "Assign to Copilot" feature

### From Pull Requests
Request review or mention the agent in PR description if `accept_pull_requests: true`

## Troubleshooting

### Agent Not Found
- Verify file is in `.github/agents/` directory
- Check file name ends with `.agent.md`
- Reload VS Code window
- Verify YAML frontmatter is valid

### Agent Not Responding
- Check delegation configuration matches your invocation method
- Verify required tools are available in your environment
- Check agent logs in Copilot Chat for errors

### Tools Not Working
- Verify MCP servers are configured in `.vscode/mcp.json`
- Check environment variables are set
- Ensure required dependencies are installed

## Examples in This Repository

See these working examples:
- `Agent HQ.agent.md` - Complex orchestration agent
- `Test Designer.agent.md` - Jira integration agent  
- `my-agent.agent.md` - Template/example structure

All located in `.github/agents/` directory.

## Additional Resources

- [GitHub Copilot Documentation](https://docs.github.com/copilot)
- MCP Server Configuration: `../.vscode/mcp.json`
- Playwright Agents Chat Modes: `../.github/chatmodes/`
- [Agent HQ Usage Guide](agent-hq-guide.md)

## Contributing

When creating agents for team use:
1. Document the agent's purpose clearly
2. Test thoroughly before committing
3. Add usage examples to repository documentation
4. Consider edge cases and error scenarios
5. Get feedback from team members
