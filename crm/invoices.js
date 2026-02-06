// ============================================================
// 0nMCP — CRM Invoices API Tool Definitions
// ============================================================
// Full coverage of the Invoices API endpoints including
// invoices CRUD, sending, voiding, payments, invoice number
// generation, invoice templates, and invoice schedules.
// ============================================================

export default [
  // ── Invoices ─────────────────────────────────────────────────

  {
    name: "crm_list_invoices",
    description: "List invoices with optional filters, pagination, and search.",
    method: "GET",
    path: "/invoices/",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to filter invoices by",
        required: true,
      },
      contactId: {
        type: "string",
        description: "Filter invoices by contact ID",
        required: false,
      },
      status: {
        type: "string",
        description: "Filter by invoice status (e.g. draft, sent, paid, void)",
        required: false,
      },
      startAt: {
        type: "string",
        description: "Start date for filtering invoices (ISO 8601)",
        required: false,
      },
      endAt: {
        type: "string",
        description: "End date for filtering invoices (ISO 8601)",
        required: false,
      },
      search: {
        type: "string",
        description: "Search query string to match against invoices",
        required: false,
      },
      limit: {
        type: "number",
        description: "Maximum number of invoices to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of invoices to skip for pagination",
        required: false,
      },
      paymentMode: {
        type: "string",
        description: "Filter by payment mode",
        required: false,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: false,
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: false,
      },
    },
    query: [
      "locationId", "contactId", "status", "startAt", "endAt",
      "search", "limit", "offset", "paymentMode", "altId", "altType",
    ],
  },

  {
    name: "crm_get_invoice",
    description: "Get a single invoice by ID.",
    method: "GET",
    path: "/invoices/:invoiceId",
    params: {
      invoiceId: {
        type: "string",
        description: "The invoice ID to retrieve",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
      },
    },
    query: ["altId", "altType"],
  },

  {
    name: "crm_create_invoice",
    description: "Create a new invoice.",
    method: "POST",
    path: "/invoices/",
    params: {
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Invoice name or label",
        required: false,
        in: "body",
      },
      businessDetails: {
        type: "object",
        description: "Business details object (name, address, phone, email, website, logoUrl, customValues)",
        required: false,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code (e.g. 'USD')",
        required: false,
        in: "body",
      },
      items: {
        type: "array",
        description: "Array of line item objects (name, description, quantity, unitPrice, taxes, etc.)",
        required: false,
        in: "body",
      },
      discount: {
        type: "object",
        description: "Discount object (type: 'percentage' or 'fixed', value: number)",
        required: false,
        in: "body",
      },
      termsNotes: {
        type: "string",
        description: "Terms and notes text displayed on the invoice",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Invoice title displayed at the top of the invoice",
        required: false,
        in: "body",
      },
      contactDetails: {
        type: "object",
        description: "Contact details object (name, email, phone, address, etc.)",
        required: false,
        in: "body",
      },
      invoiceNumber: {
        type: "string",
        description: "Custom invoice number",
        required: false,
        in: "body",
      },
      issueDate: {
        type: "string",
        description: "Issue date in ISO 8601 format",
        required: false,
        in: "body",
      },
      dueDate: {
        type: "string",
        description: "Due date in ISO 8601 format",
        required: false,
        in: "body",
      },
      sentTo: {
        type: "object",
        description: "Recipient details for sending the invoice",
        required: false,
        in: "body",
      },
      liveMode: {
        type: "boolean",
        description: "Whether the invoice is in live mode (true) or test mode (false)",
        required: false,
        in: "body",
      },
      locationId: {
        type: "string",
        description: "Location ID the invoice belongs to",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "businessDetails", "currency",
      "items", "discount", "termsNotes", "title", "contactDetails",
      "invoiceNumber", "issueDate", "dueDate", "sentTo", "liveMode",
      "locationId",
    ],
  },

  {
    name: "crm_update_invoice",
    description: "Update an existing invoice by ID.",
    method: "PUT",
    path: "/invoices/:invoiceId",
    params: {
      invoiceId: {
        type: "string",
        description: "The invoice ID to update",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Invoice name or label",
        required: false,
        in: "body",
      },
      businessDetails: {
        type: "object",
        description: "Business details object (name, address, phone, email, website, logoUrl, customValues)",
        required: false,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code (e.g. 'USD')",
        required: false,
        in: "body",
      },
      items: {
        type: "array",
        description: "Array of line item objects (name, description, quantity, unitPrice, taxes, etc.)",
        required: false,
        in: "body",
      },
      discount: {
        type: "object",
        description: "Discount object (type: 'percentage' or 'fixed', value: number)",
        required: false,
        in: "body",
      },
      termsNotes: {
        type: "string",
        description: "Terms and notes text displayed on the invoice",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Invoice title displayed at the top of the invoice",
        required: false,
        in: "body",
      },
      contactDetails: {
        type: "object",
        description: "Contact details object (name, email, phone, address, etc.)",
        required: false,
        in: "body",
      },
      invoiceNumber: {
        type: "string",
        description: "Custom invoice number",
        required: false,
        in: "body",
      },
      issueDate: {
        type: "string",
        description: "Issue date in ISO 8601 format",
        required: false,
        in: "body",
      },
      dueDate: {
        type: "string",
        description: "Due date in ISO 8601 format",
        required: false,
        in: "body",
      },
      sentTo: {
        type: "object",
        description: "Recipient details for sending the invoice",
        required: false,
        in: "body",
      },
      liveMode: {
        type: "boolean",
        description: "Whether the invoice is in live mode (true) or test mode (false)",
        required: false,
        in: "body",
      },
      locationId: {
        type: "string",
        description: "Location ID the invoice belongs to",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "businessDetails", "currency",
      "items", "discount", "termsNotes", "title", "contactDetails",
      "invoiceNumber", "issueDate", "dueDate", "sentTo", "liveMode",
      "locationId",
    ],
  },

  {
    name: "crm_delete_invoice",
    description: "Delete an invoice by ID.",
    method: "DELETE",
    path: "/invoices/:invoiceId",
    params: {
      invoiceId: {
        type: "string",
        description: "The invoice ID to delete",
        required: true,
      },
    },
  },

  {
    name: "crm_send_invoice",
    description: "Send an invoice to the recipient via email or SMS.",
    method: "POST",
    path: "/invoices/:invoiceId/send",
    params: {
      invoiceId: {
        type: "string",
        description: "The invoice ID to send",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      userId: {
        type: "string",
        description: "User ID of the sender",
        required: false,
        in: "body",
      },
      liveMode: {
        type: "boolean",
        description: "Whether to send in live mode (true) or test mode (false)",
        required: false,
        in: "body",
      },
      action: {
        type: "string",
        description: "Send action type (e.g. 'sms', 'email')",
        required: false,
        in: "body",
      },
    },
    body: ["altId", "altType", "userId", "liveMode", "action"],
  },

  {
    name: "crm_void_invoice",
    description: "Void an invoice, marking it as cancelled and no longer payable.",
    method: "POST",
    path: "/invoices/:invoiceId/void",
    params: {
      invoiceId: {
        type: "string",
        description: "The invoice ID to void",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
    },
    body: ["altId", "altType"],
  },

  {
    name: "crm_record_payment",
    description: "Record a manual payment against an invoice.",
    method: "POST",
    path: "/invoices/:invoiceId/record-payment",
    params: {
      invoiceId: {
        type: "string",
        description: "The invoice ID to record the payment for",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      mode: {
        type: "string",
        description: "Payment mode (e.g. 'cash', 'cheque', 'bank_transfer', 'other')",
        required: true,
        in: "body",
      },
      amount: {
        type: "number",
        description: "Payment amount in the invoice currency",
        required: true,
        in: "body",
      },
      notes: {
        type: "string",
        description: "Optional notes for the payment record",
        required: false,
        in: "body",
      },
    },
    body: ["altId", "altType", "mode", "amount", "notes"],
  },

  {
    name: "crm_generate_invoice_number",
    description: "Generate the next sequential invoice number for a location.",
    method: "GET",
    path: "/invoices/generate-invoice-number",
    params: {
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
      },
    },
    query: ["altId", "altType"],
  },

  // ── Invoice Templates ────────────────────────────────────────

  {
    name: "crm_list_invoice_templates",
    description: "List invoice templates with optional filters and pagination.",
    method: "GET",
    path: "/invoices/template/",
    params: {
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
      },
      limit: {
        type: "number",
        description: "Maximum number of templates to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of templates to skip for pagination",
        required: false,
      },
      search: {
        type: "string",
        description: "Search query string to match against templates",
        required: false,
      },
      status: {
        type: "string",
        description: "Filter by template status",
        required: false,
      },
      paymentMode: {
        type: "string",
        description: "Filter by payment mode",
        required: false,
      },
    },
    query: ["altId", "altType", "limit", "offset", "search", "status", "paymentMode"],
  },

  {
    name: "crm_get_invoice_template",
    description: "Get a single invoice template by ID.",
    method: "GET",
    path: "/invoices/template/:templateId",
    params: {
      templateId: {
        type: "string",
        description: "The template ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_invoice_template",
    description: "Create a new invoice template.",
    method: "POST",
    path: "/invoices/template/",
    params: {
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Template name",
        required: true,
        in: "body",
      },
      businessDetails: {
        type: "object",
        description: "Business details object (name, address, phone, email, website, logoUrl, customValues)",
        required: false,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code (e.g. 'USD')",
        required: false,
        in: "body",
      },
      items: {
        type: "array",
        description: "Array of line item objects (name, description, quantity, unitPrice, taxes, etc.)",
        required: false,
        in: "body",
      },
      discount: {
        type: "object",
        description: "Discount object (type: 'percentage' or 'fixed', value: number)",
        required: false,
        in: "body",
      },
      termsNotes: {
        type: "string",
        description: "Terms and notes text displayed on invoices created from this template",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Template title displayed at the top of generated invoices",
        required: false,
        in: "body",
      },
      internalNotes: {
        type: "string",
        description: "Internal notes visible only to the team, not on the invoice",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "businessDetails", "currency",
      "items", "discount", "termsNotes", "title", "internalNotes",
    ],
  },

  {
    name: "crm_update_invoice_template",
    description: "Update an existing invoice template by ID.",
    method: "PUT",
    path: "/invoices/template/:templateId",
    params: {
      templateId: {
        type: "string",
        description: "The template ID to update",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Template name",
        required: false,
        in: "body",
      },
      businessDetails: {
        type: "object",
        description: "Business details object (name, address, phone, email, website, logoUrl, customValues)",
        required: false,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code (e.g. 'USD')",
        required: false,
        in: "body",
      },
      items: {
        type: "array",
        description: "Array of line item objects (name, description, quantity, unitPrice, taxes, etc.)",
        required: false,
        in: "body",
      },
      discount: {
        type: "object",
        description: "Discount object (type: 'percentage' or 'fixed', value: number)",
        required: false,
        in: "body",
      },
      termsNotes: {
        type: "string",
        description: "Terms and notes text displayed on invoices created from this template",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Template title displayed at the top of generated invoices",
        required: false,
        in: "body",
      },
      internalNotes: {
        type: "string",
        description: "Internal notes visible only to the team, not on the invoice",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "businessDetails", "currency",
      "items", "discount", "termsNotes", "title", "internalNotes",
    ],
  },

  {
    name: "crm_delete_invoice_template",
    description: "Delete an invoice template by ID.",
    method: "DELETE",
    path: "/invoices/template/:templateId",
    params: {
      templateId: {
        type: "string",
        description: "The template ID to delete",
        required: true,
      },
    },
  },

  // ── Invoice Schedules ────────────────────────────────────────

  {
    name: "crm_list_invoice_schedules",
    description: "List invoice schedules with optional filters and pagination.",
    method: "GET",
    path: "/invoices/schedule/",
    params: {
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
      },
      limit: {
        type: "number",
        description: "Maximum number of schedules to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of schedules to skip for pagination",
        required: false,
      },
      paymentMode: {
        type: "string",
        description: "Filter by payment mode",
        required: false,
      },
    },
    query: ["altId", "altType", "limit", "offset", "paymentMode"],
  },

  {
    name: "crm_get_invoice_schedule",
    description: "Get a single invoice schedule by ID.",
    method: "GET",
    path: "/invoices/schedule/:scheduleId",
    params: {
      scheduleId: {
        type: "string",
        description: "The schedule ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_invoice_schedule",
    description: "Create a new recurring invoice schedule.",
    method: "POST",
    path: "/invoices/schedule/",
    params: {
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Schedule name or label",
        required: true,
        in: "body",
      },
      live: {
        type: "boolean",
        description: "Whether the schedule is in live mode (true) or test mode (false)",
        required: false,
        in: "body",
      },
      contactDetails: {
        type: "object",
        description: "Contact details object (name, email, phone, address, etc.)",
        required: false,
        in: "body",
      },
      schedule: {
        type: "object",
        description: "Schedule configuration object (frequency, interval, startDate, endDate, etc.)",
        required: true,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code (e.g. 'USD')",
        required: false,
        in: "body",
      },
      items: {
        type: "array",
        description: "Array of line item objects (name, description, quantity, unitPrice, taxes, etc.)",
        required: false,
        in: "body",
      },
      discount: {
        type: "object",
        description: "Discount object (type: 'percentage' or 'fixed', value: number)",
        required: false,
        in: "body",
      },
      termsNotes: {
        type: "string",
        description: "Terms and notes text displayed on scheduled invoices",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Invoice title displayed at the top of generated invoices",
        required: false,
        in: "body",
      },
      businessDetails: {
        type: "object",
        description: "Business details object (name, address, phone, email, website, logoUrl, customValues)",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "live", "contactDetails", "schedule",
      "currency", "items", "discount", "termsNotes", "title", "businessDetails",
    ],
  },

  {
    name: "crm_update_invoice_schedule",
    description: "Update an existing invoice schedule by ID.",
    method: "PUT",
    path: "/invoices/schedule/:scheduleId",
    params: {
      scheduleId: {
        type: "string",
        description: "The schedule ID to update",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternate ID for the location",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternate ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Schedule name or label",
        required: false,
        in: "body",
      },
      live: {
        type: "boolean",
        description: "Whether the schedule is in live mode (true) or test mode (false)",
        required: false,
        in: "body",
      },
      contactDetails: {
        type: "object",
        description: "Contact details object (name, email, phone, address, etc.)",
        required: false,
        in: "body",
      },
      schedule: {
        type: "object",
        description: "Schedule configuration object (frequency, interval, startDate, endDate, etc.)",
        required: false,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code (e.g. 'USD')",
        required: false,
        in: "body",
      },
      items: {
        type: "array",
        description: "Array of line item objects (name, description, quantity, unitPrice, taxes, etc.)",
        required: false,
        in: "body",
      },
      discount: {
        type: "object",
        description: "Discount object (type: 'percentage' or 'fixed', value: number)",
        required: false,
        in: "body",
      },
      termsNotes: {
        type: "string",
        description: "Terms and notes text displayed on scheduled invoices",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Invoice title displayed at the top of generated invoices",
        required: false,
        in: "body",
      },
      businessDetails: {
        type: "object",
        description: "Business details object (name, address, phone, email, website, logoUrl, customValues)",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "live", "contactDetails", "schedule",
      "currency", "items", "discount", "termsNotes", "title", "businessDetails",
    ],
  },

  {
    name: "crm_delete_invoice_schedule",
    description: "Delete an invoice schedule by ID.",
    method: "DELETE",
    path: "/invoices/schedule/:scheduleId",
    params: {
      scheduleId: {
        type: "string",
        description: "The schedule ID to delete",
        required: true,
      },
    },
  },

  {
    name: "crm_auto_payment_schedule",
    description: "Enable or manage auto-payment for an invoice schedule.",
    method: "POST",
    path: "/invoices/schedule/:scheduleId/auto-payment",
    params: {
      scheduleId: {
        type: "string",
        description: "The schedule ID to configure auto-payment for",
        required: true,
      },
    },
  },
];
