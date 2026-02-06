// ============================================================
// 0nMCP — CRM OAuth / Auth Tools
// ============================================================
// These require custom logic and don't fit the data-driven pattern.
// ============================================================

import { CRM_API_BASE, crmHeaders } from "./helpers.js";

const AUTH_URL = "https://marketplace.leadconnectorhq.com/oauth/chooselocation";
const TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";

/**
 * Register CRM OAuth tools on the MCP server.
 */
export function registerAuthTools(server, z) {
  // ─── crm_auth_url ──────────────────────────────────────
  server.tool(
    "crm_auth_url",
    "Generate the OAuth authorization URL for connecting a CRM sub-account.",
    {
      client_id: z.string().describe("CRM Marketplace app Client ID"),
      redirect_uri: z.string().describe("OAuth redirect URI"),
    },
    async ({ client_id, redirect_uri }) => {
      const scopes = [
        "contacts.readonly", "contacts.write",
        "opportunities.readonly", "opportunities.write",
        "locations.readonly", "locations.write",
        "locations/customValues.readonly", "locations/customValues.write",
        "locations/customFields.readonly", "locations/customFields.write",
        "locations/tags.readonly", "locations/tags.write",
        "locations/templates.readonly",
        "calendars.readonly", "calendars.write",
        "calendars/events.readonly", "calendars/events.write",
        "conversations.readonly", "conversations.write",
        "conversations/message.readonly", "conversations/message.write",
        "workflows.readonly",
        "forms.readonly", "forms.write",
        "funnels/funnel.readonly", "funnels/page.readonly",
        "users.readonly", "users.write",
        "oauth.readonly", "oauth.write",
        "snapshots.readonly", "snapshots.write",
        "businesses.readonly", "businesses.write",
        "campaigns.readonly",
        "invoices.readonly", "invoices.write",
        "payments.readonly", "payments.write",
        "products.readonly", "products.write",
        "medias.readonly", "medias.write",
        "objects.readonly", "objects.write",
        "associations.readonly", "associations.write",
        "blogs.readonly", "blogs.write",
        "socialplanner.readonly", "socialplanner.write",
        "surveys.readonly",
        "courses.readonly",
        "saas/company.read", "saas/company.write",
        "saas/location.read", "saas/location.write",
        "links.readonly", "links.write",
        "emails.readonly", "emails.write",
      ].join(" ");

      const authUrl = `${AUTH_URL}?response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&client_id=${client_id}&scope=${encodeURIComponent(scopes)}`;
      return { content: [{ type: "text", text: JSON.stringify({ authUrl }, null, 2) }] };
    }
  );

  // ─── crm_exchange_token ────────────────────────────────
  server.tool(
    "crm_exchange_token",
    "Exchange an OAuth authorization code for access and refresh tokens.",
    {
      client_id: z.string().describe("CRM Marketplace app Client ID"),
      client_secret: z.string().describe("CRM Marketplace app Client Secret"),
      code: z.string().describe("Authorization code from OAuth callback"),
      redirect_uri: z.string().describe("OAuth redirect URI"),
    },
    async ({ client_id, client_secret, code, redirect_uri }) => {
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id, client_secret, grant_type: "authorization_code", code, redirect_uri }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Token exchange failed", details: data }, null, 2) }] };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            location_id: data.locationId,
            company_id: data.companyId,
          }, null, 2),
        }],
      };
    }
  );

  // ─── crm_refresh_token ─────────────────────────────────
  server.tool(
    "crm_refresh_token",
    "Refresh an expired CRM access token.",
    {
      client_id: z.string().describe("CRM Marketplace app Client ID"),
      client_secret: z.string().describe("CRM Marketplace app Client Secret"),
      refresh_token: z.string().describe("Refresh token from previous auth"),
    },
    async ({ client_id, client_secret, refresh_token }) => {
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id, client_secret, grant_type: "refresh_token", refresh_token }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Token refresh failed", details: data }, null, 2) }] };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            location_id: data.locationId,
          }, null, 2),
        }],
      };
    }
  );

  // ─── crm_deploy_snapshot ───────────────────────────────
  server.tool(
    "crm_deploy_snapshot",
    "Deploy a full snapshot — pipeline, tags, custom values, and workflow definitions — in a single operation.",
    {
      access_token: z.string().describe("CRM access token"),
      location_id: z.string().describe("CRM sub-account location ID"),
      snapshot: z.object({
        pipeline: z.object({ name: z.string(), stages: z.array(z.string()) }).optional(),
        tags: z.array(z.string()).optional(),
        custom_values: z.record(z.string()).optional(),
        workflows: z.array(z.any()).optional(),
      }).describe("Full snapshot definition"),
    },
    async ({ access_token, location_id, snapshot }) => {
      const headers = crmHeaders(access_token);
      const report = { pipeline: null, tags: [], custom_values: [], workflows: [], errors: [] };

      if (snapshot.pipeline) {
        try {
          const res = await fetch(`${CRM_API_BASE}/opportunities/pipelines`, {
            method: "POST", headers,
            body: JSON.stringify({ name: snapshot.pipeline.name, stages: snapshot.pipeline.stages.map((name, i) => ({ name, position: i })), locationId: location_id }),
          });
          const data = await res.json().catch(() => ({}));
          report.pipeline = { status: res.ok ? "created" : "failed", name: snapshot.pipeline.name, stages: snapshot.pipeline.stages.length, id: data.id || data.pipeline?.id };
        } catch (err) {
          report.errors.push({ step: "pipeline", message: err.message });
        }
      }

      if (snapshot.tags) {
        for (const tag of snapshot.tags) {
          try {
            const res = await fetch(`${CRM_API_BASE}/locations/${location_id}/tags`, { method: "POST", headers, body: JSON.stringify({ name: tag }) });
            report.tags.push({ tag, status: res.ok ? "created" : "exists" });
          } catch (err) { report.tags.push({ tag, status: "error", message: err.message }); }
        }
      }

      if (snapshot.custom_values) {
        for (const [name, value] of Object.entries(snapshot.custom_values)) {
          try {
            const res = await fetch(`${CRM_API_BASE}/locations/${location_id}/customValues`, { method: "POST", headers, body: JSON.stringify({ name, value: value || "" }) });
            report.custom_values.push({ name, status: res.ok ? "created" : "exists" });
          } catch (err) { report.custom_values.push({ name, status: "error", message: err.message }); }
        }
      }

      if (snapshot.workflows) {
        for (const wf of snapshot.workflows) {
          const wfReport = { id: wf.id, name: wf.name, tags_created: 0, custom_values_created: 0, status: "ready" };
          if (wf.actions) {
            for (const action of wf.actions) {
              if (action.type === "add_tag" && action.value) {
                try {
                  const res = await fetch(`${CRM_API_BASE}/locations/${location_id}/tags`, { method: "POST", headers, body: JSON.stringify({ name: action.value }) });
                  if (res.ok) wfReport.tags_created++;
                } catch {}
              }
            }
          }
          if (wf.custom_values) {
            for (const [name, value] of Object.entries(wf.custom_values)) {
              try {
                const res = await fetch(`${CRM_API_BASE}/locations/${location_id}/customValues`, { method: "POST", headers, body: JSON.stringify({ name, value: value || "" }) });
                if (res.ok) wfReport.custom_values_created++;
              } catch {}
            }
          }
          report.workflows.push(wfReport);
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "deployed", location_id,
            summary: {
              pipeline: report.pipeline ? report.pipeline.status : "skipped",
              tags_total: report.tags.length,
              custom_values_total: report.custom_values.length,
              workflows_processed: report.workflows.length,
              errors: report.errors.length,
            },
            report,
          }, null, 2),
        }],
      };
    }
  );

  // ─── crm_process_workflow ──────────────────────────────
  server.tool(
    "crm_process_workflow",
    "Process a workflow JSON definition. Creates tags and custom values, returns workflow JSON ready for builder injection.",
    {
      access_token: z.string().describe("CRM access token"),
      location_id: z.string().describe("CRM sub-account location ID"),
      workflow: z.object({
        id: z.string().optional(),
        name: z.string(),
        trigger: z.any().optional(),
        goal: z.any().optional(),
        custom_values: z.record(z.string()).optional(),
        actions: z.array(z.any()),
      }).describe("Workflow JSON definition"),
    },
    async ({ access_token, location_id, workflow }) => {
      const headers = crmHeaders(access_token);

      const tags = [];
      for (const action of workflow.actions || []) {
        if (action.type === "add_tag" && action.value) tags.push(action.value);
      }
      const tagResults = [];
      for (const tag of [...new Set(tags)]) {
        try {
          const res = await fetch(`${CRM_API_BASE}/locations/${location_id}/tags`, { method: "POST", headers, body: JSON.stringify({ name: tag }) });
          tagResults.push({ tag, status: res.ok ? "created" : "exists" });
        } catch (err) { tagResults.push({ tag, status: "error", message: err.message }); }
      }

      const cvResults = [];
      if (workflow.custom_values) {
        for (const [name, value] of Object.entries(workflow.custom_values)) {
          try {
            const res = await fetch(`${CRM_API_BASE}/locations/${location_id}/customValues`, { method: "POST", headers, body: JSON.stringify({ name, value: value || "" }) });
            cvResults.push({ name, status: res.ok ? "created" : "exists" });
          } catch (err) { cvResults.push({ name, status: "error", message: err.message }); }
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            workflow_name: workflow.name,
            workflow_id: workflow.id,
            tags_processed: tagResults,
            custom_values_processed: cvResults,
            workflow_json: workflow,
            status: "ready",
          }, null, 2),
        }],
      };
    }
  );
}
