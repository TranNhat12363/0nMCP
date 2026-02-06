// ============================================================
// 0nMCP — CRM Calendar Tool Definitions
// ============================================================
// Data-driven definitions for Calendars, Events, Appointments,
// Calendar Groups, Calendar Resources, and Blocked Slots.
// Fed into registerTools() from helpers.js.
// ============================================================

const calendarTools = [
  // ── Calendars ─────────────────────────────────────────────

  {
    name: "crm_list_calendars",
    description: "List all calendars in the CRM. Optionally filter by group or include drafts.",
    method: "GET",
    path: "/calendars/",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true },
      groupId: { type: "string", description: "Filter calendars by group ID", required: false },
      showDrafts: { type: "boolean", description: "Include draft calendars in results", required: false },
    },
    query: ["locationId", "groupId", "showDrafts"],
  },

  {
    name: "crm_get_calendar",
    description: "Get a single calendar by its ID from the CRM.",
    method: "GET",
    path: "/calendars/:calendarId",
    params: {
      calendarId: { type: "string", description: "Calendar ID", required: true },
    },
  },

  {
    name: "crm_create_calendar",
    description: "Create a new calendar in the CRM.",
    method: "POST",
    path: "/calendars/",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Calendar name", required: true, in: "body" },
      description: { type: "string", description: "Calendar description", required: false, in: "body" },
      slug: { type: "string", description: "URL-friendly slug", required: false, in: "body" },
      widgetSlug: { type: "string", description: "Widget slug identifier", required: false, in: "body" },
      widgetType: { type: "string", description: "Widget display type", required: false, in: "body" },
      calendarType: { type: "string", description: "Calendar type (e.g. round_robin, event, class_booking, collective, service_booking)", required: false, in: "body" },
      teamMembers: { type: "array", description: "Array of team member objects assigned to this calendar", required: false, in: "body" },
      eventTitle: { type: "string", description: "Default event title", required: false, in: "body" },
      eventColor: { type: "string", description: "Event color hex code", required: false, in: "body" },
      meetingLocation: { type: "string", description: "Default meeting location", required: false, in: "body" },
      slotDuration: { type: "number", description: "Duration of each slot in minutes", required: false, in: "body" },
      slotInterval: { type: "number", description: "Interval between slots in minutes", required: false, in: "body" },
      slotBuffer: { type: "number", description: "Buffer time between slots in minutes", required: false, in: "body" },
      preBuffer: { type: "number", description: "Pre-event buffer time", required: false, in: "body" },
      preBufferUnit: { type: "string", description: "Unit for pre-event buffer (e.g. mins, hours)", required: false, in: "body" },
      postBuffer: { type: "number", description: "Post-event buffer time", required: false, in: "body" },
      postBufferUnit: { type: "string", description: "Unit for post-event buffer (e.g. mins, hours)", required: false, in: "body" },
      appointmentPerSlot: { type: "number", description: "Max appointments per slot", required: false, in: "body" },
      appointmentPerDay: { type: "number", description: "Max appointments per day", required: false, in: "body" },
      openHours: { type: "array", description: "Array of open-hours objects defining availability windows", required: false, in: "body" },
      enableRecurring: { type: "boolean", description: "Enable recurring appointments", required: false, in: "body" },
      formId: { type: "string", description: "Form ID to associate with the calendar", required: false, in: "body" },
      stickyContact: { type: "boolean", description: "Stick returning contacts to the same team member", required: false, in: "body" },
      isLivePaymentMode: { type: "boolean", description: "Enable live payment mode", required: false, in: "body" },
      autoConfirm: { type: "boolean", description: "Auto-confirm new appointments", required: false, in: "body" },
      shouldSendAlertEmailsToAssignedMember: { type: "boolean", description: "Send alert emails to assigned team member", required: false, in: "body" },
      alertEmail: { type: "string", description: "Email address for calendar alerts", required: false, in: "body" },
      googleInvitationEmails: { type: "boolean", description: "Send Google Calendar invitation emails", required: false, in: "body" },
      allowReschedule: { type: "boolean", description: "Allow contacts to reschedule appointments", required: false, in: "body" },
      allowCancellation: { type: "boolean", description: "Allow contacts to cancel appointments", required: false, in: "body" },
      shouldAssignContactToTeamMember: { type: "boolean", description: "Assign contact to the team member upon booking", required: false, in: "body" },
      shouldSkipAssigningContactForExisting: { type: "boolean", description: "Skip reassigning existing contacts to team members", required: false, in: "body" },
      notes: { type: "string", description: "Internal notes for the calendar", required: false, in: "body" },
      pixelId: { type: "string", description: "Tracking pixel ID", required: false, in: "body" },
      formSubmitType: { type: "string", description: "Form submit action type (e.g. message, redirect)", required: false, in: "body" },
      formSubmitRedirectURL: { type: "string", description: "URL to redirect after form submission", required: false, in: "body" },
      formSubmitThanksMessage: { type: "string", description: "Thank-you message shown after form submission", required: false, in: "body" },
      availabilityType: { type: "number", description: "Availability type identifier", required: false, in: "body" },
      guestType: { type: "string", description: "Guest type setting", required: false, in: "body" },
      consentLabel: { type: "string", description: "Consent checkbox label text", required: false, in: "body" },
      calendarCoverImage: { type: "string", description: "URL of the calendar cover image", required: false, in: "body" },
      id: { type: "string", description: "Custom calendar ID (optional, auto-generated if omitted)", required: false, in: "body" },
    },
    body: [
      "locationId", "name", "description", "slug", "widgetSlug", "widgetType",
      "calendarType", "teamMembers", "eventTitle", "eventColor", "meetingLocation",
      "slotDuration", "slotInterval", "slotBuffer", "preBuffer", "preBufferUnit",
      "postBuffer", "postBufferUnit", "appointmentPerSlot", "appointmentPerDay",
      "openHours", "enableRecurring", "formId", "stickyContact", "isLivePaymentMode",
      "autoConfirm", "shouldSendAlertEmailsToAssignedMember", "alertEmail",
      "googleInvitationEmails", "allowReschedule", "allowCancellation",
      "shouldAssignContactToTeamMember", "shouldSkipAssigningContactForExisting",
      "notes", "pixelId", "formSubmitType", "formSubmitRedirectURL",
      "formSubmitThanksMessage", "availabilityType", "guestType", "consentLabel",
      "calendarCoverImage", "id",
    ],
  },

  {
    name: "crm_update_calendar",
    description: "Update an existing calendar in the CRM.",
    method: "PUT",
    path: "/calendars/:calendarId",
    params: {
      calendarId: { type: "string", description: "Calendar ID to update", required: true },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: false, in: "body" },
      name: { type: "string", description: "Calendar name", required: false, in: "body" },
      description: { type: "string", description: "Calendar description", required: false, in: "body" },
      slug: { type: "string", description: "URL-friendly slug", required: false, in: "body" },
      widgetSlug: { type: "string", description: "Widget slug identifier", required: false, in: "body" },
      widgetType: { type: "string", description: "Widget display type", required: false, in: "body" },
      calendarType: { type: "string", description: "Calendar type (e.g. round_robin, event, class_booking, collective, service_booking)", required: false, in: "body" },
      teamMembers: { type: "array", description: "Array of team member objects assigned to this calendar", required: false, in: "body" },
      eventTitle: { type: "string", description: "Default event title", required: false, in: "body" },
      eventColor: { type: "string", description: "Event color hex code", required: false, in: "body" },
      meetingLocation: { type: "string", description: "Default meeting location", required: false, in: "body" },
      slotDuration: { type: "number", description: "Duration of each slot in minutes", required: false, in: "body" },
      slotInterval: { type: "number", description: "Interval between slots in minutes", required: false, in: "body" },
      slotBuffer: { type: "number", description: "Buffer time between slots in minutes", required: false, in: "body" },
      preBuffer: { type: "number", description: "Pre-event buffer time", required: false, in: "body" },
      preBufferUnit: { type: "string", description: "Unit for pre-event buffer (e.g. mins, hours)", required: false, in: "body" },
      postBuffer: { type: "number", description: "Post-event buffer time", required: false, in: "body" },
      postBufferUnit: { type: "string", description: "Unit for post-event buffer (e.g. mins, hours)", required: false, in: "body" },
      appointmentPerSlot: { type: "number", description: "Max appointments per slot", required: false, in: "body" },
      appointmentPerDay: { type: "number", description: "Max appointments per day", required: false, in: "body" },
      openHours: { type: "array", description: "Array of open-hours objects defining availability windows", required: false, in: "body" },
      enableRecurring: { type: "boolean", description: "Enable recurring appointments", required: false, in: "body" },
      formId: { type: "string", description: "Form ID to associate with the calendar", required: false, in: "body" },
      stickyContact: { type: "boolean", description: "Stick returning contacts to the same team member", required: false, in: "body" },
      isLivePaymentMode: { type: "boolean", description: "Enable live payment mode", required: false, in: "body" },
      autoConfirm: { type: "boolean", description: "Auto-confirm new appointments", required: false, in: "body" },
      shouldSendAlertEmailsToAssignedMember: { type: "boolean", description: "Send alert emails to assigned team member", required: false, in: "body" },
      alertEmail: { type: "string", description: "Email address for calendar alerts", required: false, in: "body" },
      googleInvitationEmails: { type: "boolean", description: "Send Google Calendar invitation emails", required: false, in: "body" },
      allowReschedule: { type: "boolean", description: "Allow contacts to reschedule appointments", required: false, in: "body" },
      allowCancellation: { type: "boolean", description: "Allow contacts to cancel appointments", required: false, in: "body" },
      shouldAssignContactToTeamMember: { type: "boolean", description: "Assign contact to the team member upon booking", required: false, in: "body" },
      shouldSkipAssigningContactForExisting: { type: "boolean", description: "Skip reassigning existing contacts to team members", required: false, in: "body" },
      notes: { type: "string", description: "Internal notes for the calendar", required: false, in: "body" },
      pixelId: { type: "string", description: "Tracking pixel ID", required: false, in: "body" },
      formSubmitType: { type: "string", description: "Form submit action type (e.g. message, redirect)", required: false, in: "body" },
      formSubmitRedirectURL: { type: "string", description: "URL to redirect after form submission", required: false, in: "body" },
      formSubmitThanksMessage: { type: "string", description: "Thank-you message shown after form submission", required: false, in: "body" },
      availabilityType: { type: "number", description: "Availability type identifier", required: false, in: "body" },
      guestType: { type: "string", description: "Guest type setting", required: false, in: "body" },
      consentLabel: { type: "string", description: "Consent checkbox label text", required: false, in: "body" },
      calendarCoverImage: { type: "string", description: "URL of the calendar cover image", required: false, in: "body" },
      id: { type: "string", description: "Custom calendar ID", required: false, in: "body" },
    },
    body: [
      "locationId", "name", "description", "slug", "widgetSlug", "widgetType",
      "calendarType", "teamMembers", "eventTitle", "eventColor", "meetingLocation",
      "slotDuration", "slotInterval", "slotBuffer", "preBuffer", "preBufferUnit",
      "postBuffer", "postBufferUnit", "appointmentPerSlot", "appointmentPerDay",
      "openHours", "enableRecurring", "formId", "stickyContact", "isLivePaymentMode",
      "autoConfirm", "shouldSendAlertEmailsToAssignedMember", "alertEmail",
      "googleInvitationEmails", "allowReschedule", "allowCancellation",
      "shouldAssignContactToTeamMember", "shouldSkipAssigningContactForExisting",
      "notes", "pixelId", "formSubmitType", "formSubmitRedirectURL",
      "formSubmitThanksMessage", "availabilityType", "guestType", "consentLabel",
      "calendarCoverImage", "id",
    ],
  },

  {
    name: "crm_delete_calendar",
    description: "Delete a calendar from the CRM by its ID.",
    method: "DELETE",
    path: "/calendars/:calendarId",
    params: {
      calendarId: { type: "string", description: "Calendar ID to delete", required: true },
    },
  },

  // ── Free Slots ────────────────────────────────────────────

  {
    name: "crm_get_free_slots",
    description: "Get available free slots for a specific CRM calendar within a date range.",
    method: "GET",
    path: "/calendars/:calendarId/free-slots",
    params: {
      calendarId: { type: "string", description: "Calendar ID to check availability", required: true },
      startDate: { type: "string", description: "Start date for slot lookup (epoch ms or ISO string)", required: true },
      endDate: { type: "string", description: "End date for slot lookup (epoch ms or ISO string)", required: true },
      timezone: { type: "string", description: "IANA timezone (e.g. America/New_York)", required: false },
      userId: { type: "string", description: "Filter slots by specific user / team member ID", required: false },
    },
    query: ["startDate", "endDate", "timezone", "userId"],
  },

  // ── Events ────────────────────────────────────────────────

  {
    name: "crm_list_events",
    description: "List calendar events in the CRM. Filter by calendar, date range, user, or group.",
    method: "GET",
    path: "/calendars/events",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true },
      calendarId: { type: "string", description: "Filter by calendar ID", required: false },
      startTime: { type: "string", description: "Start time filter (epoch ms or ISO string)", required: false },
      endTime: { type: "string", description: "End time filter (epoch ms or ISO string)", required: false },
      userId: { type: "string", description: "Filter by assigned user ID", required: false },
      groupId: { type: "string", description: "Filter by calendar group ID", required: false },
    },
    query: ["locationId", "calendarId", "startTime", "endTime", "userId", "groupId"],
  },

  {
    name: "crm_get_event",
    description: "Get a single calendar event by its ID from the CRM.",
    method: "GET",
    path: "/calendars/events/:eventId",
    params: {
      eventId: { type: "string", description: "Event ID", required: true },
    },
  },

  {
    name: "crm_create_event",
    description: "Create a new calendar event in the CRM.",
    method: "POST",
    path: "/calendars/events",
    params: {
      calendarId: { type: "string", description: "Calendar ID to create the event in", required: true, in: "body" },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      contactId: { type: "string", description: "Contact ID to associate with the event", required: true, in: "body" },
      groupId: { type: "string", description: "Calendar group ID", required: false, in: "body" },
      appointmentStatus: { type: "string", description: "Status of the appointment (e.g. confirmed, cancelled, showed, noshow, invalid)", required: false, in: "body" },
      title: { type: "string", description: "Event title", required: false, in: "body" },
      notes: { type: "string", description: "Event notes", required: false, in: "body" },
      startTime: { type: "string", description: "Event start time (ISO string)", required: true, in: "body" },
      endTime: { type: "string", description: "Event end time (ISO string)", required: true, in: "body" },
      selectedTimezone: { type: "string", description: "IANA timezone for the event", required: false, in: "body" },
      selectedSlot: { type: "string", description: "Selected slot identifier", required: false, in: "body" },
      address: { type: "string", description: "Event address / location", required: false, in: "body" },
      toNotify: { type: "boolean", description: "Send notification to the contact", required: false, in: "body" },
      assignedUserId: { type: "string", description: "User ID to assign the event to", required: false, in: "body" },
    },
    body: [
      "calendarId", "locationId", "contactId", "groupId", "appointmentStatus",
      "title", "notes", "startTime", "endTime", "selectedTimezone", "selectedSlot",
      "address", "toNotify", "assignedUserId",
    ],
  },

  {
    name: "crm_update_event",
    description: "Update an existing calendar event in the CRM.",
    method: "PUT",
    path: "/calendars/events/:eventId",
    params: {
      eventId: { type: "string", description: "Event ID to update", required: true },
      calendarId: { type: "string", description: "Calendar ID", required: false, in: "body" },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: false, in: "body" },
      contactId: { type: "string", description: "Contact ID to associate with the event", required: false, in: "body" },
      groupId: { type: "string", description: "Calendar group ID", required: false, in: "body" },
      appointmentStatus: { type: "string", description: "Status of the appointment (e.g. confirmed, cancelled, showed, noshow, invalid)", required: false, in: "body" },
      title: { type: "string", description: "Event title", required: false, in: "body" },
      notes: { type: "string", description: "Event notes", required: false, in: "body" },
      startTime: { type: "string", description: "Event start time (ISO string)", required: false, in: "body" },
      endTime: { type: "string", description: "Event end time (ISO string)", required: false, in: "body" },
      selectedTimezone: { type: "string", description: "IANA timezone for the event", required: false, in: "body" },
      selectedSlot: { type: "string", description: "Selected slot identifier", required: false, in: "body" },
      address: { type: "string", description: "Event address / location", required: false, in: "body" },
      toNotify: { type: "boolean", description: "Send notification to the contact", required: false, in: "body" },
      assignedUserId: { type: "string", description: "User ID to assign the event to", required: false, in: "body" },
    },
    body: [
      "calendarId", "locationId", "contactId", "groupId", "appointmentStatus",
      "title", "notes", "startTime", "endTime", "selectedTimezone", "selectedSlot",
      "address", "toNotify", "assignedUserId",
    ],
  },

  {
    name: "crm_delete_event",
    description: "Delete a calendar event from the CRM by its ID.",
    method: "DELETE",
    path: "/calendars/events/:eventId",
    params: {
      eventId: { type: "string", description: "Event ID to delete", required: true },
    },
  },

  // ── Appointments ──────────────────────────────────────────

  {
    name: "crm_get_appointment",
    description: "Get a single appointment by its event ID from the CRM.",
    method: "GET",
    path: "/calendars/events/appointments/:eventId",
    params: {
      eventId: { type: "string", description: "Event / appointment ID", required: true },
    },
  },

  {
    name: "crm_create_appointment",
    description: "Create a new appointment in the CRM. Supports slot validation overrides.",
    method: "POST",
    path: "/calendars/events/appointments",
    params: {
      calendarId: { type: "string", description: "Calendar ID to book the appointment in", required: true, in: "body" },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      contactId: { type: "string", description: "Contact ID for the appointment", required: true, in: "body" },
      startTime: { type: "string", description: "Appointment start time (ISO string)", required: true, in: "body" },
      endTime: { type: "string", description: "Appointment end time (ISO string)", required: true, in: "body" },
      title: { type: "string", description: "Appointment title", required: false, in: "body" },
      appointmentStatus: { type: "string", description: "Status (e.g. confirmed, cancelled, showed, noshow, invalid)", required: false, in: "body" },
      assignedUserId: { type: "string", description: "User ID to assign the appointment to", required: false, in: "body" },
      address: { type: "string", description: "Appointment address / location", required: false, in: "body" },
      ignoreDateRange: { type: "boolean", description: "Ignore calendar date-range restrictions", required: false, in: "body" },
      toNotify: { type: "boolean", description: "Send notification to the contact", required: false, in: "body" },
      ignoreFreeSlotValidation: { type: "boolean", description: "Skip free-slot validation checks", required: false, in: "body" },
      notes: { type: "string", description: "Appointment notes", required: false, in: "body" },
      tz: { type: "string", description: "Short timezone identifier", required: false, in: "body" },
      selectedTimezone: { type: "string", description: "IANA timezone (e.g. America/New_York)", required: false, in: "body" },
      selectedSlot: { type: "string", description: "Selected slot identifier", required: false, in: "body" },
    },
    body: [
      "calendarId", "locationId", "contactId", "startTime", "endTime", "title",
      "appointmentStatus", "assignedUserId", "address", "ignoreDateRange",
      "toNotify", "ignoreFreeSlotValidation", "notes", "tz", "selectedTimezone",
      "selectedSlot",
    ],
  },

  {
    name: "crm_update_appointment",
    description: "Update an existing appointment in the CRM.",
    method: "PUT",
    path: "/calendars/events/appointments/:eventId",
    params: {
      eventId: { type: "string", description: "Event / appointment ID to update", required: true },
      calendarId: { type: "string", description: "Calendar ID", required: false, in: "body" },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: false, in: "body" },
      contactId: { type: "string", description: "Contact ID for the appointment", required: false, in: "body" },
      startTime: { type: "string", description: "Appointment start time (ISO string)", required: false, in: "body" },
      endTime: { type: "string", description: "Appointment end time (ISO string)", required: false, in: "body" },
      title: { type: "string", description: "Appointment title", required: false, in: "body" },
      appointmentStatus: { type: "string", description: "Status (e.g. confirmed, cancelled, showed, noshow, invalid)", required: false, in: "body" },
      assignedUserId: { type: "string", description: "User ID to assign the appointment to", required: false, in: "body" },
      address: { type: "string", description: "Appointment address / location", required: false, in: "body" },
      ignoreDateRange: { type: "boolean", description: "Ignore calendar date-range restrictions", required: false, in: "body" },
      toNotify: { type: "boolean", description: "Send notification to the contact", required: false, in: "body" },
      ignoreFreeSlotValidation: { type: "boolean", description: "Skip free-slot validation checks", required: false, in: "body" },
      notes: { type: "string", description: "Appointment notes", required: false, in: "body" },
      tz: { type: "string", description: "Short timezone identifier", required: false, in: "body" },
      selectedTimezone: { type: "string", description: "IANA timezone (e.g. America/New_York)", required: false, in: "body" },
      selectedSlot: { type: "string", description: "Selected slot identifier", required: false, in: "body" },
    },
    body: [
      "calendarId", "locationId", "contactId", "startTime", "endTime", "title",
      "appointmentStatus", "assignedUserId", "address", "ignoreDateRange",
      "toNotify", "ignoreFreeSlotValidation", "notes", "tz", "selectedTimezone",
      "selectedSlot",
    ],
  },

  // ── Calendar Groups ───────────────────────────────────────

  {
    name: "crm_list_calendar_groups",
    description: "List all calendar groups in the CRM for a location.",
    method: "GET",
    path: "/calendars/groups",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true },
    },
    query: ["locationId"],
  },

  {
    name: "crm_create_calendar_group",
    description: "Create a new calendar group in the CRM.",
    method: "POST",
    path: "/calendars/groups",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Group name", required: true, in: "body" },
      description: { type: "string", description: "Group description", required: false, in: "body" },
      slug: { type: "string", description: "URL-friendly slug for the group", required: false, in: "body" },
      isActive: { type: "boolean", description: "Whether the group is active", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "slug", "isActive"],
  },

  {
    name: "crm_update_calendar_group",
    description: "Update an existing calendar group in the CRM.",
    method: "PUT",
    path: "/calendars/groups/:groupId",
    params: {
      groupId: { type: "string", description: "Group ID to update", required: true },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: false, in: "body" },
      name: { type: "string", description: "Group name", required: false, in: "body" },
      description: { type: "string", description: "Group description", required: false, in: "body" },
      slug: { type: "string", description: "URL-friendly slug for the group", required: false, in: "body" },
      isActive: { type: "boolean", description: "Whether the group is active", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "slug", "isActive"],
  },

  {
    name: "crm_delete_calendar_group",
    description: "Delete a calendar group from the CRM by its ID.",
    method: "DELETE",
    path: "/calendars/groups/:groupId",
    params: {
      groupId: { type: "string", description: "Group ID to delete", required: true },
    },
  },

  {
    name: "crm_validate_groups_slug",
    description: "Validate whether a calendar group slug is available in the CRM.",
    method: "POST",
    path: "/calendars/groups/validate-slug",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      slug: { type: "string", description: "Slug to validate", required: true, in: "body" },
    },
    body: ["locationId", "slug"],
  },

  // ── Calendar Resources ────────────────────────────────────

  {
    name: "crm_list_calendar_resources",
    description: "List all calendar resources (rooms, equipment, etc.) in the CRM for a location.",
    method: "GET",
    path: "/calendars/resources",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true },
    },
    query: ["locationId"],
  },

  {
    name: "crm_get_calendar_resource",
    description: "Get a single calendar resource by its ID from the CRM.",
    method: "GET",
    path: "/calendars/resources/:resourceId",
    params: {
      resourceId: { type: "string", description: "Resource ID", required: true },
    },
  },

  {
    name: "crm_create_calendar_resource",
    description: "Create a new calendar resource (room, equipment, etc.) in the CRM.",
    method: "POST",
    path: "/calendars/resources",
    params: {
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Resource name", required: true, in: "body" },
      description: { type: "string", description: "Resource description", required: false, in: "body" },
      quantity: { type: "number", description: "Total quantity of this resource", required: false, in: "body" },
      outOfService: { type: "number", description: "Number of units currently out of service", required: false, in: "body" },
      capacity: { type: "number", description: "Capacity per resource unit", required: false, in: "body" },
      calendarIds: { type: "array_string", description: "Array of calendar IDs this resource is linked to", required: false, in: "body" },
      isActive: { type: "boolean", description: "Whether the resource is active", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "quantity", "outOfService", "capacity", "calendarIds", "isActive"],
  },

  {
    name: "crm_update_calendar_resource",
    description: "Update an existing calendar resource in the CRM.",
    method: "PUT",
    path: "/calendars/resources/:resourceId",
    params: {
      resourceId: { type: "string", description: "Resource ID to update", required: true },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: false, in: "body" },
      name: { type: "string", description: "Resource name", required: false, in: "body" },
      description: { type: "string", description: "Resource description", required: false, in: "body" },
      quantity: { type: "number", description: "Total quantity of this resource", required: false, in: "body" },
      outOfService: { type: "number", description: "Number of units currently out of service", required: false, in: "body" },
      capacity: { type: "number", description: "Capacity per resource unit", required: false, in: "body" },
      calendarIds: { type: "array_string", description: "Array of calendar IDs this resource is linked to", required: false, in: "body" },
      isActive: { type: "boolean", description: "Whether the resource is active", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "quantity", "outOfService", "capacity", "calendarIds", "isActive"],
  },

  {
    name: "crm_delete_calendar_resource",
    description: "Delete a calendar resource from the CRM by its ID.",
    method: "DELETE",
    path: "/calendars/resources/:resourceId",
    params: {
      resourceId: { type: "string", description: "Resource ID to delete", required: true },
    },
  },

  // ── Blocked Slots ─────────────────────────────────────────

  {
    name: "crm_create_blocked_slot",
    description: "Create a blocked time slot on a CRM calendar to prevent bookings.",
    method: "POST",
    path: "/calendars/blocked-slots",
    params: {
      calendarId: { type: "string", description: "Calendar ID to block time on", required: true, in: "body" },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: true, in: "body" },
      startTime: { type: "string", description: "Block start time (ISO string)", required: true, in: "body" },
      endTime: { type: "string", description: "Block end time (ISO string)", required: true, in: "body" },
      title: { type: "string", description: "Title / reason for the blocked slot", required: false, in: "body" },
      assignedUserId: { type: "string", description: "User ID whose calendar is blocked", required: false, in: "body" },
    },
    body: ["calendarId", "locationId", "startTime", "endTime", "title", "assignedUserId"],
  },

  {
    name: "crm_update_blocked_slot",
    description: "Update an existing blocked time slot in the CRM.",
    method: "PUT",
    path: "/calendars/blocked-slots/:blockedSlotId",
    params: {
      blockedSlotId: { type: "string", description: "Blocked slot ID to update", required: true },
      calendarId: { type: "string", description: "Calendar ID", required: false, in: "body" },
      locationId: { type: "string", description: "CRM location / sub-account ID", required: false, in: "body" },
      startTime: { type: "string", description: "Block start time (ISO string)", required: false, in: "body" },
      endTime: { type: "string", description: "Block end time (ISO string)", required: false, in: "body" },
      title: { type: "string", description: "Title / reason for the blocked slot", required: false, in: "body" },
      assignedUserId: { type: "string", description: "User ID whose calendar is blocked", required: false, in: "body" },
    },
    body: ["calendarId", "locationId", "startTime", "endTime", "title", "assignedUserId"],
  },

  {
    name: "crm_delete_blocked_slot",
    description: "Delete a blocked time slot from the CRM by its ID.",
    method: "DELETE",
    path: "/calendars/blocked-slots/:blockedSlotId",
    params: {
      blockedSlotId: { type: "string", description: "Blocked slot ID to delete", required: true },
    },
  },
];

export default calendarTools;
