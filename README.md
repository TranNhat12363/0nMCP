# 0nMCP

Rocket CRM Automation MCP Server. Deploy pipelines, tags, workflows, and full snapshots to CRM sub-accounts through any AI agent.

## Tools

| Tool | Description |
|------|-------------|
| `crm_auth_url` | Generate OAuth authorization URL |
| `crm_exchange_token` | Exchange auth code for access/refresh tokens |
| `crm_refresh_token` | Refresh an expired access token |
| `crm_create_tags` | Bulk create tags |
| `crm_create_pipeline` | Create pipeline with ordered stages |
| `crm_create_custom_values` | Push custom key-value pairs |
| `crm_process_workflow` | Process single workflow JSON (extract tags + custom values) |
| `crm_deploy_snapshot` | Full deployment: pipeline + tags + custom values + all workflows |
| `crm_list_workflows` | List existing workflows (read-only) |
| `crm_list_pipelines` | List existing pipelines and stages |

## Setup

### Add to Claude Code

Already configured in `.claude.json`:

```json
{
  "0nMCP": {
    "type": "stdio",
    "command": "node",
    "args": ["/Users/rocketopp/Github/0nMCP/index.js"]
  }
}
```

### Usage

Restart Claude Code. The 10 CRM tools will be available. Example:

> "Deploy a 12-stage sales pipeline with all tags and custom values to location X"

The agent calls `crm_deploy_snapshot` with the full JSON and it's done.

## Auth Flow

1. Call `crm_auth_url` with your Client ID and redirect URI
2. Open the returned URL in browser, authorize the sub-account
3. The callback returns `access_token`, `refresh_token`, `location_id`
4. Use the access token with any other tool

## Full Snapshot JSON Format

```json
{
  "pipeline": {
    "name": "Sales Pipeline",
    "stages": ["001. New Lead", "002. Attempt to Contact", "..."]
  },
  "tags": ["New Lead", "FB Lead", "..."],
  "custom_values": {
    "calendar_link": "https://...",
    "support_email": "support@..."
  },
  "workflows": [
    {
      "id": "001a",
      "name": "001.a New Lead In (FB Lead)",
      "trigger": { "type": "added_from_workflow", "source": "000" },
      "custom_values": { "welcome_sms": "Hey {{contact.first_name}}..." },
      "actions": [
        { "type": "send_sms", "message": "{{custom_values.welcome_sms}}" },
        { "type": "wait", "duration": "10 minutes" },
        { "type": "add_tag", "value": "New Lead" }
      ]
    }
  ]
}
```
