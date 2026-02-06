// ============================================================
// 0nMCP — CRM Conversations & Messaging Tool Definitions
// ============================================================
// Data-driven tool definitions for the CRM Conversations API.
// Covers conversations, messages, attachments, scheduling,
// inbound processing, and email threads.
// ============================================================

const conversationTools = [
  // ── Conversations ─────────────────────────────────────────

  {
    name: "crm_list_conversations",
    description: "List conversations with optional filters for contact, assignee, status, and search.",
    method: "GET",
    path: "/conversations/",
    params: {
      locationId: { type: "string", description: "Location ID", required: true },
      contactId: { type: "string", description: "Filter by contact ID", required: false },
      assignedTo: { type: "string", description: "Filter by assigned user ID", required: false },
      status: { type: "string", description: "Conversation status filter (all, read, unread, starred)", required: false },
      sort: { type: "string", description: "Sort field", required: false },
      sortDirection: { type: "string", description: "Sort direction (asc or desc)", required: false },
      limit: { type: "string", description: "Max results to return", required: false },
      startAfterDate: { type: "string", description: "Return conversations after this date (epoch ms)", required: false },
      after: { type: "string", description: "Cursor for pagination", required: false },
      searchString: { type: "string", description: "Search conversations by keyword", required: false },
      id: { type: "string", description: "Filter by conversation ID", required: false },
    },
    query: [
      "locationId",
      "contactId",
      "assignedTo",
      "status",
      "sort",
      "sortDirection",
      "limit",
      "startAfterDate",
      "after",
      "searchString",
      "id",
    ],
  },

  {
    name: "crm_get_conversation",
    description: "Get a single conversation by its ID.",
    method: "GET",
    path: "/conversations/:conversationId",
    params: {
      conversationId: { type: "string", description: "Conversation ID", required: true },
    },
  },

  {
    name: "crm_create_conversation",
    description: "Create a new conversation for a contact.",
    method: "POST",
    path: "/conversations/",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      contactId: { type: "string", description: "Contact ID to create the conversation for", required: true, in: "body" },
    },
    body: ["locationId", "contactId"],
  },

  {
    name: "crm_update_conversation",
    description: "Update a conversation (assign, star, mark read/unread, add feedback).",
    method: "PUT",
    path: "/conversations/:conversationId",
    params: {
      conversationId: { type: "string", description: "Conversation ID", required: true },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      assignedTo: { type: "string", description: "User ID to assign the conversation to", required: false, in: "body" },
      unreadCount: { type: "number", description: "Set unread message count", required: false, in: "body" },
      starred: { type: "boolean", description: "Star or unstar the conversation", required: false, in: "body" },
      feedback: { type: "object", description: "Feedback object for the conversation", required: false, in: "body" },
    },
    body: ["locationId", "assignedTo", "unreadCount", "starred", "feedback"],
  },

  {
    name: "crm_delete_conversation",
    description: "Delete a conversation by its ID.",
    method: "DELETE",
    path: "/conversations/:conversationId",
    params: {
      conversationId: { type: "string", description: "Conversation ID", required: true },
    },
  },

  // ── Messages ──────────────────────────────────────────────

  {
    name: "crm_send_message",
    description: "Send an outbound message (SMS, Email, WhatsApp, GMB, IG, FB, Custom, Live_Chat).",
    method: "POST",
    path: "/conversations/messages",
    params: {
      type: { type: "string", description: "Message channel type (SMS, Email, WhatsApp, GMB, IG, FB, Custom, Live_Chat)", required: true, in: "body" },
      contactId: { type: "string", description: "Contact ID to send the message to", required: true, in: "body" },
      message: { type: "string", description: "Message body text", required: false, in: "body" },
      subject: { type: "string", description: "Email subject line", required: false, in: "body" },
      emailFrom: { type: "string", description: "From email address", required: false, in: "body" },
      emailTo: { type: "string", description: "To email address", required: false, in: "body" },
      emailCc: { type: "array_string", description: "CC email addresses", required: false, in: "body" },
      emailBcc: { type: "array_string", description: "BCC email addresses", required: false, in: "body" },
      html: { type: "string", description: "HTML body for email messages", required: false, in: "body" },
      attachments: { type: "array", description: "Array of attachment URLs", required: false, in: "body" },
      conversationId: { type: "string", description: "Existing conversation ID to send within", required: false, in: "body" },
      conversationProviderId: { type: "string", description: "Conversation provider ID", required: false, in: "body" },
      altId: { type: "string", description: "Alternate ID for custom channel", required: false, in: "body" },
      replyToMessageId: { type: "string", description: "Message ID to reply to", required: false, in: "body" },
      templateId: { type: "string", description: "Template ID for pre-built messages", required: false, in: "body" },
      scheduledTimestamp: { type: "number", description: "Unix timestamp (ms) to schedule the message", required: false, in: "body" },
    },
    body: [
      "type",
      "contactId",
      "message",
      "subject",
      "emailFrom",
      "emailTo",
      "emailCc",
      "emailBcc",
      "html",
      "attachments",
      "conversationId",
      "conversationProviderId",
      "altId",
      "replyToMessageId",
      "templateId",
      "scheduledTimestamp",
    ],
  },

  {
    name: "crm_list_messages",
    description: "List messages within a conversation.",
    method: "GET",
    path: "/conversations/:conversationId/messages",
    params: {
      conversationId: { type: "string", description: "Conversation ID", required: true },
      lastMessageId: { type: "string", description: "Cursor: last message ID for pagination", required: false },
      limit: { type: "string", description: "Max messages to return", required: false },
      type: { type: "string", description: "Filter by message type", required: false },
    },
    query: ["lastMessageId", "limit", "type"],
  },

  {
    name: "crm_get_message",
    description: "Get a single message by its ID.",
    method: "GET",
    path: "/conversations/messages/:messageId",
    params: {
      messageId: { type: "string", description: "Message ID", required: true },
    },
  },

  {
    name: "crm_update_message_status",
    description: "Update the delivery status of a message.",
    method: "PUT",
    path: "/conversations/messages/:messageId/status",
    params: {
      messageId: { type: "string", description: "Message ID", required: true },
      status: { type: "string", description: "New status (pending, delivered, read, failed, etc.)", required: true, in: "body" },
      error: { type: "string", description: "Error details if status is failed", required: false, in: "body" },
    },
    body: ["status", "error"],
  },

  {
    name: "crm_cancel_scheduled_message",
    description: "Cancel a previously scheduled message.",
    method: "DELETE",
    path: "/conversations/messages/:messageId/schedule",
    params: {
      messageId: { type: "string", description: "Scheduled message ID to cancel", required: true },
    },
  },

  {
    name: "crm_upload_message_attachment",
    description: "Upload a file attachment for use in a conversation message.",
    method: "POST",
    path: "/conversations/messages/upload",
    params: {
      conversationId: { type: "string", description: "Conversation ID to attach the file to", required: true, in: "body" },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      attachmentUrl: { type: "string", description: "Public URL of the file to upload", required: true, in: "body" },
    },
    body: ["conversationId", "locationId", "attachmentUrl"],
  },

  {
    name: "crm_process_inbound_message",
    description: "Process an inbound message received from an external channel.",
    method: "POST",
    path: "/conversations/messages/inbound",
    params: {
      type: { type: "string", description: "Message channel type (SMS, Email, WhatsApp, GMB, IG, FB, Custom, Live_Chat)", required: true, in: "body" },
      conversationId: { type: "string", description: "Conversation ID", required: false, in: "body" },
      message: { type: "string", description: "Inbound message body", required: true, in: "body" },
      altId: { type: "string", description: "Alternate ID for custom channel", required: false, in: "body" },
      conversationProviderId: { type: "string", description: "Conversation provider ID", required: false, in: "body" },
      direction: { type: "string", description: "Message direction (inbound)", required: false, in: "body" },
    },
    body: ["type", "conversationId", "message", "altId", "conversationProviderId", "direction"],
  },

  // ── Email Threads ─────────────────────────────────────────

  {
    name: "crm_get_email_by_thread",
    description: "Get an email message and its thread by the email message ID.",
    method: "GET",
    path: "/conversations/messages/email/:emailMessageId",
    params: {
      emailMessageId: { type: "string", description: "Email message ID (thread ID)", required: true },
    },
  },
];

export default conversationTools;
