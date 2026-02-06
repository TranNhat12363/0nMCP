// ============================================================
// 0nMCP — CRM Contacts API Tool Definitions
// ============================================================
// Full coverage of the Contacts v2 API endpoints including
// contacts CRUD, tasks, notes, tags, appointments, workflows,
// campaigns, and followers.
// ============================================================

export default [
  // ── Core Contact CRUD ───────────────────────────────────────

  {
    name: "crm_search_contacts",
    description: "Search contacts with filters, sorting, and pagination.",
    method: "POST",
    path: "/contacts/search",
    params: {
      query: {
        type: "string",
        description: "Search query string to match against contact fields",
        required: false,
        in: "body",
      },
      locationId: {
        type: "string",
        description: "Location ID to search within",
        required: true,
        in: "body",
      },
      filters: {
        type: "array",
        description: "Array of filter objects to narrow results (e.g. [{field:'email',operator:'eq',value:'test@example.com'}])",
        required: false,
        in: "body",
      },
      page: {
        type: "number",
        description: "Page number for pagination (starts at 1)",
        required: false,
        in: "body",
      },
      pageLimit: {
        type: "number",
        description: "Number of results per page (max 100)",
        required: false,
        in: "body",
      },
      sort: {
        type: "string",
        description: "Field name to sort results by",
        required: false,
        in: "body",
      },
      sortDirection: {
        type: "string",
        description: "Sort direction: 'asc' or 'desc'",
        required: false,
        in: "body",
      },
    },
    body: ["query", "locationId", "filters", "page", "pageLimit", "sort", "sortDirection"],
  },

  {
    name: "crm_get_contact",
    description: "Get a single contact by ID.",
    method: "GET",
    path: "/contacts/:contactId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_contact",
    description: "Create a new contact.",
    method: "POST",
    path: "/contacts/",
    params: {
      firstName: {
        type: "string",
        description: "Contact first name",
        required: false,
        in: "body",
      },
      lastName: {
        type: "string",
        description: "Contact last name",
        required: false,
        in: "body",
      },
      email: {
        type: "string",
        description: "Contact email address",
        required: false,
        in: "body",
      },
      phone: {
        type: "string",
        description: "Contact phone number",
        required: false,
        in: "body",
      },
      address1: {
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
      postalCode: {
        type: "string",
        description: "Postal / ZIP code",
        required: false,
        in: "body",
      },
      website: {
        type: "string",
        description: "Contact website URL",
        required: false,
        in: "body",
      },
      timezone: {
        type: "string",
        description: "Contact timezone (e.g. 'America/New_York')",
        required: false,
        in: "body",
      },
      dnd: {
        type: "boolean",
        description: "Do Not Disturb flag",
        required: false,
        in: "body",
      },
      tags: {
        type: "array_string",
        description: "Array of tag strings to apply to the contact",
        required: false,
        in: "body",
      },
      source: {
        type: "string",
        description: "Lead source for the contact",
        required: false,
        in: "body",
      },
      companyName: {
        type: "string",
        description: "Company name associated with the contact",
        required: false,
        in: "body",
      },
      locationId: {
        type: "string",
        description: "Location ID the contact belongs to",
        required: true,
        in: "body",
      },
    },
    body: [
      "firstName", "lastName", "email", "phone",
      "address1", "city", "state", "postalCode",
      "website", "timezone", "dnd", "tags",
      "source", "companyName", "locationId",
    ],
  },

  {
    name: "crm_update_contact",
    description: "Update an existing contact by ID.",
    method: "PUT",
    path: "/contacts/:contactId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to update",
        required: true,
      },
      firstName: {
        type: "string",
        description: "Contact first name",
        required: false,
        in: "body",
      },
      lastName: {
        type: "string",
        description: "Contact last name",
        required: false,
        in: "body",
      },
      email: {
        type: "string",
        description: "Contact email address",
        required: false,
        in: "body",
      },
      phone: {
        type: "string",
        description: "Contact phone number",
        required: false,
        in: "body",
      },
      address1: {
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
      postalCode: {
        type: "string",
        description: "Postal / ZIP code",
        required: false,
        in: "body",
      },
      website: {
        type: "string",
        description: "Contact website URL",
        required: false,
        in: "body",
      },
      timezone: {
        type: "string",
        description: "Contact timezone (e.g. 'America/New_York')",
        required: false,
        in: "body",
      },
      dnd: {
        type: "boolean",
        description: "Do Not Disturb flag",
        required: false,
        in: "body",
      },
      tags: {
        type: "array_string",
        description: "Array of tag strings to apply to the contact",
        required: false,
        in: "body",
      },
      source: {
        type: "string",
        description: "Lead source for the contact",
        required: false,
        in: "body",
      },
      companyName: {
        type: "string",
        description: "Company name associated with the contact",
        required: false,
        in: "body",
      },
      locationId: {
        type: "string",
        description: "Location ID the contact belongs to",
        required: false,
        in: "body",
      },
    },
    body: [
      "firstName", "lastName", "email", "phone",
      "address1", "city", "state", "postalCode",
      "website", "timezone", "dnd", "tags",
      "source", "companyName", "locationId",
    ],
  },

  {
    name: "crm_delete_contact",
    description: "Delete a contact by ID.",
    method: "DELETE",
    path: "/contacts/:contactId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to delete",
        required: true,
      },
    },
  },

  {
    name: "crm_upsert_contact",
    description: "Create or update a contact matched by email or phone. If a contact with the given email or phone exists it will be updated; otherwise a new contact is created.",
    method: "POST",
    path: "/contacts/upsert",
    params: {
      firstName: {
        type: "string",
        description: "Contact first name",
        required: false,
        in: "body",
      },
      lastName: {
        type: "string",
        description: "Contact last name",
        required: false,
        in: "body",
      },
      email: {
        type: "string",
        description: "Contact email address (used for matching)",
        required: false,
        in: "body",
      },
      phone: {
        type: "string",
        description: "Contact phone number (used for matching)",
        required: false,
        in: "body",
      },
      address1: {
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
      postalCode: {
        type: "string",
        description: "Postal / ZIP code",
        required: false,
        in: "body",
      },
      website: {
        type: "string",
        description: "Contact website URL",
        required: false,
        in: "body",
      },
      timezone: {
        type: "string",
        description: "Contact timezone (e.g. 'America/New_York')",
        required: false,
        in: "body",
      },
      dnd: {
        type: "boolean",
        description: "Do Not Disturb flag",
        required: false,
        in: "body",
      },
      tags: {
        type: "array_string",
        description: "Array of tag strings to apply to the contact",
        required: false,
        in: "body",
      },
      source: {
        type: "string",
        description: "Lead source for the contact",
        required: false,
        in: "body",
      },
      companyName: {
        type: "string",
        description: "Company name associated with the contact",
        required: false,
        in: "body",
      },
      locationId: {
        type: "string",
        description: "Location ID the contact belongs to",
        required: true,
        in: "body",
      },
    },
    body: [
      "firstName", "lastName", "email", "phone",
      "address1", "city", "state", "postalCode",
      "website", "timezone", "dnd", "tags",
      "source", "companyName", "locationId",
    ],
  },

  // ── Contact Tasks ───────────────────────────────────────────

  {
    name: "crm_get_contact_tasks",
    description: "List all tasks for a contact.",
    method: "GET",
    path: "/contacts/:contactId/tasks",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to list tasks for",
        required: true,
      },
    },
  },

  {
    name: "crm_create_contact_task",
    description: "Create a new task for a contact.",
    method: "POST",
    path: "/contacts/:contactId/tasks",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to create the task for",
        required: true,
      },
      title: {
        type: "string",
        description: "Task title",
        required: true,
        in: "body",
      },
      body: {
        type: "string",
        description: "Task description / body text",
        required: false,
        in: "body",
      },
      dueDate: {
        type: "string",
        description: "Due date in ISO 8601 format",
        required: false,
        in: "body",
      },
      completed: {
        type: "boolean",
        description: "Whether the task is completed",
        required: false,
        in: "body",
      },
      assignedTo: {
        type: "string",
        description: "User ID to assign the task to",
        required: false,
        in: "body",
      },
    },
    body: ["title", "body", "dueDate", "completed", "assignedTo"],
  },

  {
    name: "crm_update_contact_task",
    description: "Update an existing task for a contact.",
    method: "PUT",
    path: "/contacts/:contactId/tasks/:taskId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID",
        required: true,
      },
      taskId: {
        type: "string",
        description: "The task ID to update",
        required: true,
      },
      title: {
        type: "string",
        description: "Task title",
        required: false,
        in: "body",
      },
      body: {
        type: "string",
        description: "Task description / body text",
        required: false,
        in: "body",
      },
      dueDate: {
        type: "string",
        description: "Due date in ISO 8601 format",
        required: false,
        in: "body",
      },
      completed: {
        type: "boolean",
        description: "Whether the task is completed",
        required: false,
        in: "body",
      },
      assignedTo: {
        type: "string",
        description: "User ID to assign the task to",
        required: false,
        in: "body",
      },
    },
    body: ["title", "body", "dueDate", "completed", "assignedTo"],
  },

  {
    name: "crm_delete_contact_task",
    description: "Delete a task from a contact.",
    method: "DELETE",
    path: "/contacts/:contactId/tasks/:taskId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID",
        required: true,
      },
      taskId: {
        type: "string",
        description: "The task ID to delete",
        required: true,
      },
    },
  },

  // ── Contact Notes ───────────────────────────────────────────

  {
    name: "crm_get_contact_notes",
    description: "List all notes for a contact.",
    method: "GET",
    path: "/contacts/:contactId/notes",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to list notes for",
        required: true,
      },
    },
  },

  {
    name: "crm_create_contact_note",
    description: "Create a new note on a contact.",
    method: "POST",
    path: "/contacts/:contactId/notes",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to add the note to",
        required: true,
      },
      body: {
        type: "string",
        description: "Note content / body text",
        required: true,
        in: "body",
      },
      userId: {
        type: "string",
        description: "ID of the user creating the note",
        required: false,
        in: "body",
      },
    },
    body: ["body", "userId"],
  },

  {
    name: "crm_update_contact_note",
    description: "Update an existing note on a contact.",
    method: "PUT",
    path: "/contacts/:contactId/notes/:noteId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID",
        required: true,
      },
      noteId: {
        type: "string",
        description: "The note ID to update",
        required: true,
      },
      body: {
        type: "string",
        description: "Updated note content / body text",
        required: false,
        in: "body",
      },
      userId: {
        type: "string",
        description: "ID of the user updating the note",
        required: false,
        in: "body",
      },
    },
    body: ["body", "userId"],
  },

  {
    name: "crm_delete_contact_note",
    description: "Delete a note from a contact.",
    method: "DELETE",
    path: "/contacts/:contactId/notes/:noteId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID",
        required: true,
      },
      noteId: {
        type: "string",
        description: "The note ID to delete",
        required: true,
      },
    },
  },

  // ── Contact Tags ────────────────────────────────────────────

  {
    name: "crm_add_contact_tags",
    description: "Add one or more tags to a contact.",
    method: "POST",
    path: "/contacts/:contactId/tags",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to add tags to",
        required: true,
      },
      tags: {
        type: "array_string",
        description: "Array of tag strings to add",
        required: true,
        in: "body",
      },
    },
    body: ["tags"],
  },

  {
    name: "crm_remove_contact_tags",
    description: "Remove one or more tags from a contact.",
    method: "DELETE",
    path: "/contacts/:contactId/tags",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to remove tags from",
        required: true,
      },
      tags: {
        type: "array_string",
        description: "Array of tag strings to remove",
        required: true,
        in: "body",
      },
    },
    body: ["tags"],
  },

  // ── Contact Appointments ────────────────────────────────────

  {
    name: "crm_get_contact_appointments",
    description: "List all appointments for a contact.",
    method: "GET",
    path: "/contacts/:contactId/appointments",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to list appointments for",
        required: true,
      },
    },
  },

  // ── Contact Workflows ───────────────────────────────────────

  {
    name: "crm_add_contact_to_workflow",
    description: "Add a contact to an automation workflow.",
    method: "POST",
    path: "/contacts/:contactId/workflow/:workflowId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to add to the workflow",
        required: true,
      },
      workflowId: {
        type: "string",
        description: "The workflow ID to add the contact to",
        required: true,
      },
    },
  },

  {
    name: "crm_remove_contact_from_workflow",
    description: "Remove a contact from an automation workflow.",
    method: "DELETE",
    path: "/contacts/:contactId/workflow/:workflowId",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to remove from the workflow",
        required: true,
      },
      workflowId: {
        type: "string",
        description: "The workflow ID to remove the contact from",
        required: true,
      },
    },
  },

  // ── Contact Campaigns ───────────────────────────────────────

  {
    name: "crm_get_contact_campaigns",
    description: "Get all campaigns associated with a contact.",
    method: "GET",
    path: "/contacts/:contactId/campaigns",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to get campaigns for",
        required: true,
      },
    },
  },

  // ── Contact Followers ───────────────────────────────────────

  {
    name: "crm_add_contact_followers",
    description: "Add followers (users) to a contact.",
    method: "POST",
    path: "/contacts/:contactId/followers",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to add followers to",
        required: true,
      },
      followers: {
        type: "array_string",
        description: "Array of user IDs to add as followers",
        required: true,
        in: "body",
      },
    },
    body: ["followers"],
  },

  {
    name: "crm_remove_contact_followers",
    description: "Remove followers (users) from a contact.",
    method: "DELETE",
    path: "/contacts/:contactId/followers",
    params: {
      contactId: {
        type: "string",
        description: "The contact ID to remove followers from",
        required: true,
      },
      followers: {
        type: "array_string",
        description: "Array of user IDs to remove as followers",
        required: true,
        in: "body",
      },
    },
    body: ["followers"],
  },

  // ── Contact by Business ─────────────────────────────────────

  {
    name: "crm_get_contact_by_business",
    description: "Get contacts associated with a business ID.",
    method: "GET",
    path: "/contacts/business/:businessId",
    params: {
      businessId: {
        type: "string",
        description: "The business ID to look up contacts for",
        required: true,
      },
    },
  },
];
