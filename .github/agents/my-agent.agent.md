name:my-agent

description: 'Example custom agent template demonstrating YAML frontmatter structure and agent capabilities.'
model: 'gpt-5.1-preview'
delegation:
  accept_issues: true
  accept_pull_requests: true
  labels:
    - 'agent-hq'
    - 'custom-agent'
  assignable_via:
    - github_issues
    - github_mentions
    - chat_commands
tools:
  - filesystem.read
  - filesystem.write
  - playwright-test.browser_navigate
  - playwright-test.test_run
---
## Mission
This is an example custom agent file that demonstrates the proper structure for creating custom agents in the `.github/agents/` folder. Custom agents extend GitHub Copilot's capabilities with specialized skills and workflows.

## YAML Frontmatter Structure

The YAML frontmatter at the top of this file defines key metadata about the agent:

### Required Fields

**description**: A brief, one-line description of what this agent does.

**model**: The AI model to use for this agent (e.g., 'gpt-5.1-preview', 'gpt-4', 'gpt-4-turbo'). This specifies which language model powers the agent's capabilities.

**tools**: Array of tools/capabilities this agent can use. Examples:
- `filesystem.read`, `filesystem.write` - File operations
- `playwright-test.browser_navigate`, `playwright-test.test_run` - Playwright operations
- `jira.search`, `jira.get` - Jira integration
- `chatmode.invoke.planner`, `chatmode.invoke.generator` - Chat mode invocation

### Optional Fields

**delegation**: Configuration for how this agent can be assigned work
- `accept_issues`: Whether agent responds to GitHub issues
- `accept_pull_requests`: Whether agent responds to PRs
- `labels`: Array of GitHub labels that trigger this agent
- `assignable_via`: Methods to invoke (github_issues, github_mentions, chat_commands)

## Core Capabilities

Define what your custom agent can do. Be specific about:
1. **Primary Function**: What is the main job of this agent?
2. **Workflows**: What are the typical workflows or processes?
3. **Integration Points**: What systems or tools does it connect with?
4. **Output**: What does the agent produce or accomplish?

## Operating Procedure

Document step-by-step how the agent operates:

1. **Prerequisites Check**: What needs to be in place before starting?
2. **Main Process**: What are the steps the agent follows?
3. **Error Handling**: How does it handle failures or edge cases?
4. **Completion**: What indicates successful completion?

### Example Workflow

```
User: "Example request to this agent"
Agent:
1. First step in the process
2. Second step with validation
3. Third step with error handling
4. Report results to user
```

## Communication Style

Define how the agent communicates:
- Professional, concise, technical, friendly, etc.
- How it reports progress
- How it handles errors or ambiguity
- What format it uses for responses

## Safeguards

List important constraints:
- What the agent should NOT do
- When to ask for confirmation
- How to handle sensitive data
- Rate limits or usage restrictions

## Escalation

Define when and how to escalate:
- When to ask users for clarification
- What problems require manual intervention
- How to handle missing prerequisites