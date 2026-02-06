// ============================================================
// 0nMCP — CRM Locations API Tool Definitions
// ============================================================
// Full coverage of the Locations API endpoints including
// locations CRUD, tags, custom fields, custom values,
// templates, and tasks.
// ============================================================

export default [
  // ── Core Location CRUD ──────────────────────────────────────

  {
    name: "crm_get_location",
    description: "Get a single location by ID.",
    method: "GET",
    path: "/locations/:locationId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_update_location",
    description: "Update an existing location by ID.",
    method: "PUT",
    path: "/locations/:locationId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to update",
        required: true,
      },
      name: {
        type: "string",
        description: "Location name",
        required: false,
        in: "body",
      },
      address: {
        type: "string",
        description: "Street address",
        required: false,
        in: "body",
      },
      city: {
        type: "string",
        description: "City",
        required: false,
        in: "body",
      },
      state: {
        type: "string",
        description: "State or province",
        required: false,
        in: "body",
      },
      country: {
        type: "string",
        description: "Country code (e.g. 'US')",
        required: false,
        in: "body",
      },
      postalCode: {
        type: "string",
        description: "Postal / ZIP code",
        required: false,
        in: "body",
      },
      website: {
        type: "string",
        description: "Location website URL",
        required: false,
        in: "body",
      },
      timezone: {
        type: "string",
        description: "Location timezone (e.g. 'America/New_York')",
        required: false,
        in: "body",
      },
      phone: {
        type: "string",
        description: "Location phone number",
        required: false,
        in: "body",
      },
      email: {
        type: "string",
        description: "Location email address",
        required: false,
        in: "body",
      },
      logoUrl: {
        type: "string",
        description: "URL of the location logo image",
        required: false,
        in: "body",
      },
      companyName: {
        type: "string",
        description: "Company name for the location",
        required: false,
        in: "body",
      },
      settings: {
        type: "object",
        description: "Location settings object",
        required: false,
        in: "body",
      },
    },
    body: [
      "name", "address", "city", "state", "country",
      "postalCode", "website", "timezone", "phone",
      "email", "logoUrl", "companyName", "settings",
    ],
  },

  {
    name: "crm_search_locations",
    description: "Search locations with filters, sorting, and pagination.",
    method: "PUT",
    path: "/locations/search",
    params: {
      companyId: {
        type: "string",
        description: "Company / agency ID to search within",
        required: true,
        in: "body",
      },
      skip: {
        type: "number",
        description: "Number of results to skip for pagination",
        required: false,
        in: "body",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return",
        required: false,
        in: "body",
      },
      filters: {
        type: "array",
        description: "Array of filter objects to narrow results",
        required: false,
        in: "body",
      },
      order: {
        type: "string",
        description: "Sort direction: 'asc' or 'desc'",
        required: false,
        in: "body",
      },
      orderBy: {
        type: "string",
        description: "Field name to sort results by",
        required: false,
        in: "body",
      },
    },
    body: ["companyId", "skip", "limit", "filters", "order", "orderBy"],
  },

  {
    name: "crm_list_location_timezones",
    description: "List all supported timezones for locations.",
    method: "GET",
    path: "/locations/timezone",
    params: {},
  },

  {
    name: "crm_get_location_snippet",
    description: "Get the tracking snippet / code for a location.",
    method: "GET",
    path: "/locations/:locationId/settings/snippet",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to get the tracking snippet for",
        required: true,
      },
    },
  },

  // ── Location Tags ───────────────────────────────────────────

  {
    name: "crm_list_location_tags",
    description: "List all tags for a location.",
    method: "GET",
    path: "/locations/:locationId/tags",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to list tags for",
        required: true,
      },
    },
  },

  {
    name: "crm_get_location_tag",
    description: "Get a single tag by ID for a location.",
    method: "GET",
    path: "/locations/:locationId/tags/:tagId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      tagId: {
        type: "string",
        description: "The tag ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_location_tag",
    description: "Create a new tag for a location.",
    method: "POST",
    path: "/locations/:locationId/tags",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to create the tag in",
        required: true,
      },
      name: {
        type: "string",
        description: "Tag name",
        required: true,
        in: "body",
      },
    },
    body: ["name"],
  },

  {
    name: "crm_update_location_tag",
    description: "Update an existing tag for a location.",
    method: "PUT",
    path: "/locations/:locationId/tags/:tagId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      tagId: {
        type: "string",
        description: "The tag ID to update",
        required: true,
      },
      name: {
        type: "string",
        description: "Updated tag name",
        required: true,
        in: "body",
      },
    },
    body: ["name"],
  },

  {
    name: "crm_delete_location_tag",
    description: "Delete a tag from a location.",
    method: "DELETE",
    path: "/locations/:locationId/tags/:tagId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      tagId: {
        type: "string",
        description: "The tag ID to delete",
        required: true,
      },
    },
  },

  // ── Custom Fields ───────────────────────────────────────────

  {
    name: "crm_list_custom_fields",
    description: "List all custom fields for a location, optionally filtered by model.",
    method: "GET",
    path: "/locations/:locationId/customFields",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to list custom fields for",
        required: true,
      },
      model: {
        type: "string",
        description: "Filter by model type (e.g. 'contact', 'opportunity', 'all')",
        required: false,
        in: "query",
      },
    },
    query: ["model"],
  },

  {
    name: "crm_get_custom_field",
    description: "Get a single custom field by ID.",
    method: "GET",
    path: "/locations/:locationId/customFields/:customFieldId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      customFieldId: {
        type: "string",
        description: "The custom field ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_custom_field",
    description: "Create a new custom field for a location.",
    method: "POST",
    path: "/locations/:locationId/customFields",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to create the custom field in",
        required: true,
      },
      name: {
        type: "string",
        description: "Custom field name",
        required: true,
        in: "body",
      },
      dataType: {
        type: "string",
        description: "Data type of the field (e.g. 'TEXT', 'NUMBER', 'DATE', 'CHECKBOX', 'LIST', 'FILE_UPLOAD', 'TEXTBOX_LIST')",
        required: true,
        in: "body",
      },
      placeholder: {
        type: "string",
        description: "Placeholder text displayed in the field",
        required: false,
        in: "body",
      },
      position: {
        type: "number",
        description: "Display position / sort order of the field",
        required: false,
        in: "body",
      },
      model: {
        type: "string",
        description: "Model the field belongs to (e.g. 'contact', 'opportunity')",
        required: false,
        in: "body",
      },
      acceptedFormat: {
        type: "array",
        description: "Accepted file formats for FILE_UPLOAD fields (e.g. ['.pdf', '.jpg'])",
        required: false,
        in: "body",
      },
      isMultipleFile: {
        type: "boolean",
        description: "Whether multiple files can be uploaded (FILE_UPLOAD fields)",
        required: false,
        in: "body",
      },
      maxNumberOfFiles: {
        type: "number",
        description: "Maximum number of files allowed (FILE_UPLOAD fields)",
        required: false,
        in: "body",
      },
      textBoxListOptions: {
        type: "array",
        description: "Array of option strings for TEXTBOX_LIST or LIST fields",
        required: false,
        in: "body",
      },
      isAllowCustomOption: {
        type: "boolean",
        description: "Whether custom options can be added by users (LIST fields)",
        required: false,
        in: "body",
      },
    },
    body: [
      "name", "dataType", "placeholder", "position", "model",
      "acceptedFormat", "isMultipleFile", "maxNumberOfFiles",
      "textBoxListOptions", "isAllowCustomOption",
    ],
  },

  {
    name: "crm_update_custom_field",
    description: "Update an existing custom field for a location.",
    method: "PUT",
    path: "/locations/:locationId/customFields/:customFieldId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      customFieldId: {
        type: "string",
        description: "The custom field ID to update",
        required: true,
      },
      name: {
        type: "string",
        description: "Custom field name",
        required: false,
        in: "body",
      },
      dataType: {
        type: "string",
        description: "Data type of the field (e.g. 'TEXT', 'NUMBER', 'DATE', 'CHECKBOX', 'LIST', 'FILE_UPLOAD', 'TEXTBOX_LIST')",
        required: false,
        in: "body",
      },
      placeholder: {
        type: "string",
        description: "Placeholder text displayed in the field",
        required: false,
        in: "body",
      },
      position: {
        type: "number",
        description: "Display position / sort order of the field",
        required: false,
        in: "body",
      },
      model: {
        type: "string",
        description: "Model the field belongs to (e.g. 'contact', 'opportunity')",
        required: false,
        in: "body",
      },
      acceptedFormat: {
        type: "array",
        description: "Accepted file formats for FILE_UPLOAD fields (e.g. ['.pdf', '.jpg'])",
        required: false,
        in: "body",
      },
      isMultipleFile: {
        type: "boolean",
        description: "Whether multiple files can be uploaded (FILE_UPLOAD fields)",
        required: false,
        in: "body",
      },
      maxNumberOfFiles: {
        type: "number",
        description: "Maximum number of files allowed (FILE_UPLOAD fields)",
        required: false,
        in: "body",
      },
      textBoxListOptions: {
        type: "array",
        description: "Array of option strings for TEXTBOX_LIST or LIST fields",
        required: false,
        in: "body",
      },
      isAllowCustomOption: {
        type: "boolean",
        description: "Whether custom options can be added by users (LIST fields)",
        required: false,
        in: "body",
      },
    },
    body: [
      "name", "dataType", "placeholder", "position", "model",
      "acceptedFormat", "isMultipleFile", "maxNumberOfFiles",
      "textBoxListOptions", "isAllowCustomOption",
    ],
  },

  {
    name: "crm_delete_custom_field",
    description: "Delete a custom field from a location.",
    method: "DELETE",
    path: "/locations/:locationId/customFields/:customFieldId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      customFieldId: {
        type: "string",
        description: "The custom field ID to delete",
        required: true,
      },
    },
  },

  // ── Custom Values ───────────────────────────────────────────

  {
    name: "crm_list_custom_values",
    description: "List all custom values for a location.",
    method: "GET",
    path: "/locations/:locationId/customValues",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to list custom values for",
        required: true,
      },
    },
  },

  {
    name: "crm_get_custom_value",
    description: "Get a single custom value by ID.",
    method: "GET",
    path: "/locations/:locationId/customValues/:customValueId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      customValueId: {
        type: "string",
        description: "The custom value ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_custom_value",
    description: "Create a new custom value for a location.",
    method: "POST",
    path: "/locations/:locationId/customValues",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to create the custom value in",
        required: true,
      },
      name: {
        type: "string",
        description: "Custom value name / label",
        required: true,
        in: "body",
      },
      value: {
        type: "string",
        description: "The custom value content",
        required: true,
        in: "body",
      },
    },
    body: ["name", "value"],
  },

  {
    name: "crm_update_custom_value",
    description: "Update an existing custom value for a location.",
    method: "PUT",
    path: "/locations/:locationId/customValues/:customValueId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      customValueId: {
        type: "string",
        description: "The custom value ID to update",
        required: true,
      },
      name: {
        type: "string",
        description: "Custom value name / label",
        required: false,
        in: "body",
      },
      value: {
        type: "string",
        description: "The custom value content",
        required: false,
        in: "body",
      },
    },
    body: ["name", "value"],
  },

  {
    name: "crm_delete_custom_value",
    description: "Delete a custom value from a location.",
    method: "DELETE",
    path: "/locations/:locationId/customValues/:customValueId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      customValueId: {
        type: "string",
        description: "The custom value ID to delete",
        required: true,
      },
    },
  },

  // ── Templates ───────────────────────────────────────────────

  {
    name: "crm_list_templates",
    description: "List templates for a location, optionally filtered by type and origin.",
    method: "GET",
    path: "/locations/:locationId/templates",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to list templates for",
        required: true,
      },
      type: {
        type: "string",
        description: "Filter by template type (e.g. 'sms', 'email', 'whatsapp')",
        required: false,
        in: "query",
      },
      origin: {
        type: "string",
        description: "Filter by template origin",
        required: false,
        in: "query",
      },
      deleted: {
        type: "boolean",
        description: "Include deleted templates when true",
        required: false,
        in: "query",
      },
    },
    query: ["type", "origin", "deleted"],
  },

  {
    name: "crm_get_template",
    description: "Get a single template by ID.",
    method: "GET",
    path: "/locations/:locationId/templates/:templateId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      templateId: {
        type: "string",
        description: "The template ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_delete_template",
    description: "Delete a template from a location.",
    method: "DELETE",
    path: "/locations/:locationId/templates/:templateId",
    params: {
      locationId: {
        type: "string",
        description: "The location ID",
        required: true,
      },
      templateId: {
        type: "string",
        description: "The template ID to delete",
        required: true,
      },
    },
  },

  // ── Location Tasks ──────────────────────────────────────────

  {
    name: "crm_search_location_tasks",
    description: "Search tasks for a location with filters and pagination.",
    method: "GET",
    path: "/locations/:locationId/tasks/search",
    params: {
      locationId: {
        type: "string",
        description: "The location ID to search tasks in",
        required: true,
      },
      contactId: {
        type: "string",
        description: "Filter tasks by contact ID",
        required: false,
        in: "query",
      },
      status: {
        type: "string",
        description: "Filter by task status",
        required: false,
        in: "query",
      },
      assignedTo: {
        type: "string",
        description: "Filter by assigned user ID",
        required: false,
        in: "query",
      },
      dueDate: {
        type: "string",
        description: "Filter by due date (ISO 8601 format)",
        required: false,
        in: "query",
      },
      completed: {
        type: "boolean",
        description: "Filter by completion status",
        required: false,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return",
        required: false,
        in: "query",
      },
      skip: {
        type: "number",
        description: "Number of results to skip for pagination",
        required: false,
        in: "query",
      },
    },
    query: ["contactId", "status", "assignedTo", "dueDate", "completed", "limit", "skip"],
  },
];
