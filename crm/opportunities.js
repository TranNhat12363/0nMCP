// ============================================================
// 0nMCP — CRM Opportunities & Pipelines Tool Definitions
// ============================================================
// Data-driven tool configs for the CRM Opportunities API.
// Consumed by registerTools() from crm/helpers.js.
// ============================================================

const opportunities = [
  // ── OPPORTUNITIES ───────────────────────────────────────────

  {
    name: "crm_search_opportunities",
    description: "Search and filter opportunities across pipelines. Supports filtering by pipeline, stage, contact, status, assigned user, campaign, date range, and free-text query. Can optionally include calendar events, notes, and tasks.",
    method: "GET",
    path: "/opportunities/search",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      pipelineId: { type: "string", description: "Filter by pipeline ID", required: false, in: "query" },
      pipelineStageId: { type: "string", description: "Filter by pipeline stage ID", required: false, in: "query" },
      contactId: { type: "string", description: "Filter by contact ID", required: false, in: "query" },
      status: { type: "string", description: "Filter by status (open, won, lost, abandoned, all)", required: false, in: "query" },
      assignedTo: { type: "string", description: "Filter by assigned user ID", required: false, in: "query" },
      campaignId: { type: "string", description: "Filter by campaign ID", required: false, in: "query" },
      startDate: { type: "string", description: "Start date for date range filter (YYYY-MM-DD)", required: false, in: "query" },
      endDate: { type: "string", description: "End date for date range filter (YYYY-MM-DD)", required: false, in: "query" },
      getCalendarEvents: { type: "boolean", description: "Include calendar events in response", required: false, in: "query" },
      getNotes: { type: "boolean", description: "Include notes in response", required: false, in: "query" },
      getTasks: { type: "boolean", description: "Include tasks in response", required: false, in: "query" },
      q: { type: "string", description: "Free-text search query", required: false, in: "query" },
      limit: { type: "number", description: "Max results to return (default 20)", required: false, in: "query" },
      page: { type: "number", description: "Page number for pagination", required: false, in: "query" },
      order: { type: "string", description: "Sort order (asc or desc)", required: false, in: "query" },
      sortBy: { type: "string", description: "Field to sort by", required: false, in: "query" },
    },
    query: [
      "locationId", "pipelineId", "pipelineStageId", "contactId",
      "status", "assignedTo", "campaignId", "startDate", "endDate",
      "getCalendarEvents", "getNotes", "getTasks", "q",
      "limit", "page", "order", "sortBy",
    ],
    body: [],
  },

  {
    name: "crm_get_opportunity",
    description: "Get a single opportunity by its ID. Returns full opportunity details including pipeline stage, contact, monetary value, and status.",
    method: "GET",
    path: "/opportunities/:opportunityId",
    params: {
      opportunityId: { type: "string", description: "Opportunity ID", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_create_opportunity",
    description: "Create a new opportunity in a pipeline. Requires pipeline ID, location ID, name, and stage. Optionally set monetary value, assigned user, contact, and source.",
    method: "POST",
    path: "/opportunities/",
    params: {
      pipelineId: { type: "string", description: "Pipeline ID to place the opportunity in", required: true, in: "body" },
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Opportunity name", required: true, in: "body" },
      pipelineStageId: { type: "string", description: "Pipeline stage ID", required: true, in: "body" },
      status: { type: "string", description: "Status (open, won, lost, abandoned)", required: true, in: "body" },
      contactId: { type: "string", description: "Associated contact ID", required: true, in: "body" },
      monetaryValue: { type: "number", description: "Monetary value of the opportunity", required: false, in: "body" },
      assignedTo: { type: "string", description: "User ID to assign the opportunity to", required: false, in: "body" },
      source: { type: "string", description: "Source of the opportunity", required: false, in: "body" },
    },
    query: [],
    body: [
      "pipelineId", "locationId", "name", "pipelineStageId",
      "status", "contactId", "monetaryValue", "assignedTo", "source",
    ],
  },

  {
    name: "crm_update_opportunity",
    description: "Update an existing opportunity. Can change pipeline, stage, status, contact, monetary value, assigned user, or source.",
    method: "PUT",
    path: "/opportunities/:opportunityId",
    params: {
      opportunityId: { type: "string", description: "Opportunity ID to update", required: true, in: "path" },
      pipelineId: { type: "string", description: "Pipeline ID", required: false, in: "body" },
      name: { type: "string", description: "Opportunity name", required: false, in: "body" },
      pipelineStageId: { type: "string", description: "Pipeline stage ID", required: false, in: "body" },
      status: { type: "string", description: "Status (open, won, lost, abandoned)", required: false, in: "body" },
      contactId: { type: "string", description: "Associated contact ID", required: false, in: "body" },
      monetaryValue: { type: "number", description: "Monetary value of the opportunity", required: false, in: "body" },
      assignedTo: { type: "string", description: "User ID to assign the opportunity to", required: false, in: "body" },
      source: { type: "string", description: "Source of the opportunity", required: false, in: "body" },
    },
    query: [],
    body: [
      "pipelineId", "name", "pipelineStageId", "status",
      "contactId", "monetaryValue", "assignedTo", "source",
    ],
  },

  {
    name: "crm_delete_opportunity",
    description: "Permanently delete an opportunity by its ID.",
    method: "DELETE",
    path: "/opportunities/:opportunityId",
    params: {
      opportunityId: { type: "string", description: "Opportunity ID to delete", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_update_opportunity_status",
    description: "Update only the status of an opportunity. Valid statuses: open, won, lost, abandoned.",
    method: "PUT",
    path: "/opportunities/:opportunityId/status",
    params: {
      opportunityId: { type: "string", description: "Opportunity ID", required: true, in: "path" },
      status: { type: "string", description: "New status (open, won, lost, abandoned)", required: true, in: "body" },
    },
    query: [],
    body: ["status"],
  },

  {
    name: "crm_upsert_opportunity",
    description: "Create or update an opportunity. If a matching opportunity exists (by pipeline, location, and contact), it will be updated; otherwise a new one is created.",
    method: "POST",
    path: "/opportunities/upsert",
    params: {
      pipelineId: { type: "string", description: "Pipeline ID", required: true, in: "body" },
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      contactId: { type: "string", description: "Associated contact ID", required: true, in: "body" },
      name: { type: "string", description: "Opportunity name", required: true, in: "body" },
      pipelineStageId: { type: "string", description: "Pipeline stage ID", required: false, in: "body" },
      status: { type: "string", description: "Status (open, won, lost, abandoned)", required: false, in: "body" },
      monetaryValue: { type: "number", description: "Monetary value of the opportunity", required: false, in: "body" },
      assignedTo: { type: "string", description: "User ID to assign the opportunity to", required: false, in: "body" },
      source: { type: "string", description: "Source of the opportunity", required: false, in: "body" },
    },
    query: [],
    body: [
      "pipelineId", "locationId", "contactId", "name",
      "pipelineStageId", "status", "monetaryValue", "assignedTo", "source",
    ],
  },

  {
    name: "crm_add_opportunity_followers",
    description: "Add one or more followers to an opportunity. Followers receive notifications about opportunity updates.",
    method: "POST",
    path: "/opportunities/:opportunityId/followers",
    params: {
      opportunityId: { type: "string", description: "Opportunity ID", required: true, in: "path" },
      followers: { type: "array_string", description: "Array of user IDs to add as followers", required: true, in: "body" },
    },
    query: [],
    body: ["followers"],
  },

  {
    name: "crm_remove_opportunity_follower",
    description: "Remove a single follower from an opportunity.",
    method: "DELETE",
    path: "/opportunities/:opportunityId/followers/:followerId",
    params: {
      opportunityId: { type: "string", description: "Opportunity ID", required: true, in: "path" },
      followerId: { type: "string", description: "User ID of the follower to remove", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  // ── PIPELINES ─────────────────────────────────────────────

  {
    name: "crm_list_pipelines",
    description: "List all pipelines and their stages for a CRM location.",
    method: "GET",
    path: "/opportunities/pipelines",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
    },
    query: ["locationId"],
    body: [],
  },

  {
    name: "crm_get_pipeline",
    description: "Get a single pipeline by its ID, including all stage details.",
    method: "GET",
    path: "/opportunities/pipelines/:pipelineId",
    params: {
      pipelineId: { type: "string", description: "Pipeline ID", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_create_pipeline",
    description: "Create a new pipeline with named stages. Each stage object should include name and position.",
    method: "POST",
    path: "/opportunities/pipelines",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Pipeline name", required: true, in: "body" },
      stages: { type: "array", description: "Array of stage objects with name and position", required: true, in: "body" },
      showInFunnel: { type: "boolean", description: "Whether to show this pipeline in the funnel view", required: false, in: "body" },
    },
    query: [],
    body: ["locationId", "name", "stages", "showInFunnel"],
  },

  {
    name: "crm_update_pipeline",
    description: "Update an existing pipeline's name, stages, or funnel visibility.",
    method: "PUT",
    path: "/opportunities/pipelines/:pipelineId",
    params: {
      pipelineId: { type: "string", description: "Pipeline ID to update", required: true, in: "path" },
      name: { type: "string", description: "Pipeline name", required: false, in: "body" },
      stages: { type: "array", description: "Array of stage objects with name and position", required: false, in: "body" },
      showInFunnel: { type: "boolean", description: "Whether to show this pipeline in the funnel view", required: false, in: "body" },
    },
    query: [],
    body: ["name", "stages", "showInFunnel"],
  },

  {
    name: "crm_delete_pipeline",
    description: "Permanently delete a pipeline and all its stages.",
    method: "DELETE",
    path: "/opportunities/pipelines/:pipelineId",
    params: {
      pipelineId: { type: "string", description: "Pipeline ID to delete", required: true, in: "path" },
    },
    query: [],
    body: [],
  },
];

export default opportunities;
