// ============================================================
// 0nMCP — CRM Payments API Tool Definitions
// ============================================================
// Full coverage of the Payments API endpoints including
// orders, transactions, subscriptions, payment integrations,
// custom providers, and coupons.
// ============================================================

export default [
  // ── Orders ────────────────────────────────────────────────────

  {
    name: "crm_list_orders",
    description: "List orders with optional filters for contact, status, date range, and payment mode.",
    method: "GET",
    path: "/payments/orders",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID to filter orders by",
        required: false,
      },
      contactId: {
        type: "string",
        description: "Contact ID to filter orders by",
        required: false,
      },
      status: {
        type: "string",
        description: "Order status filter",
        required: false,
      },
      startAt: {
        type: "string",
        description: "Start date for date range filter (ISO 8601)",
        required: false,
      },
      endAt: {
        type: "string",
        description: "End date for date range filter (ISO 8601)",
        required: false,
      },
      limit: {
        type: "number",
        description: "Maximum number of orders to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of orders to skip for pagination",
        required: false,
      },
      search: {
        type: "string",
        description: "Search query to match against order fields",
        required: false,
      },
      paymentMode: {
        type: "string",
        description: "Payment mode filter (e.g. 'live', 'test')",
        required: false,
      },
      subscriptionId: {
        type: "string",
        description: "Subscription ID to filter orders by",
        required: false,
      },
    },
    query: [
      "altId", "altType", "locationId", "contactId", "status",
      "startAt", "endAt", "limit", "offset", "search",
      "paymentMode", "subscriptionId",
    ],
  },

  {
    name: "crm_get_order",
    description: "Get a single order by ID.",
    method: "GET",
    path: "/payments/orders/:orderId",
    params: {
      orderId: {
        type: "string",
        description: "The order ID to retrieve",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
    },
    query: ["altId", "altType"],
  },

  {
    name: "crm_list_order_fulfillments",
    description: "List all fulfillments for an order.",
    method: "GET",
    path: "/payments/orders/:orderId/fulfillments",
    params: {
      orderId: {
        type: "string",
        description: "The order ID to list fulfillments for",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
    },
    query: ["altId", "altType"],
  },

  // ── Transactions ──────────────────────────────────────────────

  {
    name: "crm_list_transactions",
    description: "List transactions with optional filters for contact, date range, payment mode, and entity source.",
    method: "GET",
    path: "/payments/transactions",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID to filter transactions by",
        required: false,
      },
      contactId: {
        type: "string",
        description: "Contact ID to filter transactions by",
        required: false,
      },
      startAt: {
        type: "string",
        description: "Start date for date range filter (ISO 8601)",
        required: false,
      },
      endAt: {
        type: "string",
        description: "End date for date range filter (ISO 8601)",
        required: false,
      },
      limit: {
        type: "number",
        description: "Maximum number of transactions to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of transactions to skip for pagination",
        required: false,
      },
      search: {
        type: "string",
        description: "Search query to match against transaction fields",
        required: false,
      },
      paymentMode: {
        type: "string",
        description: "Payment mode filter (e.g. 'live', 'test')",
        required: false,
      },
      entitySourceType: {
        type: "string",
        description: "Entity source type filter",
        required: false,
      },
      entitySourceSubType: {
        type: "string",
        description: "Entity source sub-type filter",
        required: false,
      },
      entityId: {
        type: "string",
        description: "Entity ID to filter transactions by",
        required: false,
      },
      subscriptionId: {
        type: "string",
        description: "Subscription ID to filter transactions by",
        required: false,
      },
      entitySourceId: {
        type: "string",
        description: "Entity source ID to filter transactions by",
        required: false,
      },
    },
    query: [
      "altId", "altType", "locationId", "contactId", "startAt",
      "endAt", "limit", "offset", "search", "paymentMode",
      "entitySourceType", "entitySourceSubType", "entityId",
      "subscriptionId", "entitySourceId",
    ],
  },

  {
    name: "crm_get_transaction",
    description: "Get a single transaction by ID.",
    method: "GET",
    path: "/payments/transactions/:transactionId",
    params: {
      transactionId: {
        type: "string",
        description: "The transaction ID to retrieve",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID for the transaction",
        required: false,
      },
    },
    query: ["altId", "altType", "locationId"],
  },

  // ── Subscriptions ─────────────────────────────────────────────

  {
    name: "crm_list_subscriptions",
    description: "List subscriptions with optional filters for contact, date range, entity, and payment mode.",
    method: "GET",
    path: "/payments/subscriptions",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID to filter subscriptions by",
        required: false,
      },
      contactId: {
        type: "string",
        description: "Contact ID to filter subscriptions by",
        required: false,
      },
      endAt: {
        type: "string",
        description: "End date for date range filter (ISO 8601)",
        required: false,
      },
      entityId: {
        type: "string",
        description: "Entity ID to filter subscriptions by",
        required: false,
      },
      entitySourceId: {
        type: "string",
        description: "Entity source ID to filter subscriptions by",
        required: false,
      },
      limit: {
        type: "number",
        description: "Maximum number of subscriptions to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of subscriptions to skip for pagination",
        required: false,
      },
      paymentMode: {
        type: "string",
        description: "Payment mode filter (e.g. 'live', 'test')",
        required: false,
      },
      search: {
        type: "string",
        description: "Search query to match against subscription fields",
        required: false,
      },
      startAt: {
        type: "string",
        description: "Start date for date range filter (ISO 8601)",
        required: false,
      },
    },
    query: [
      "altId", "altType", "locationId", "contactId", "endAt",
      "entityId", "entitySourceId", "limit", "offset",
      "paymentMode", "search", "startAt",
    ],
  },

  {
    name: "crm_get_subscription",
    description: "Get a single subscription by ID.",
    method: "GET",
    path: "/payments/subscriptions/:subscriptionId",
    params: {
      subscriptionId: {
        type: "string",
        description: "The subscription ID to retrieve",
        required: true,
      },
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
    },
    query: ["altId", "altType"],
  },

  // ── Integration / Provider ────────────────────────────────────

  {
    name: "crm_list_payment_integrations",
    description: "List all whitelabel payment integrations.",
    method: "GET",
    path: "/payments/integrations/provider/whitelabel",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
    },
    query: ["altId", "altType"],
  },

  {
    name: "crm_create_payment_integration",
    description: "Create a new whitelabel payment integration.",
    method: "POST",
    path: "/payments/integrations/provider/whitelabel",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      uniqueName: {
        type: "string",
        description: "Unique name for the payment integration",
        required: true,
        in: "body",
      },
      title: {
        type: "string",
        description: "Display title for the payment integration",
        required: true,
        in: "body",
      },
      description: {
        type: "string",
        description: "Description of the payment integration",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "URL of the integration logo or image",
        required: false,
        in: "body",
      },
      paymentsUrl: {
        type: "string",
        description: "URL for handling payment requests",
        required: true,
        in: "body",
      },
      queryUrl: {
        type: "string",
        description: "URL for querying payment status",
        required: true,
        in: "body",
      },
      provider: {
        type: "string",
        description: "Payment provider identifier",
        required: true,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "uniqueName", "title", "description",
      "imageUrl", "paymentsUrl", "queryUrl", "provider",
    ],
  },

  {
    name: "crm_connect_custom_provider",
    description: "Connect a custom payment provider to a location.",
    method: "POST",
    path: "/payments/custom-provider/connect",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to connect the provider to",
        required: true,
        in: "body",
      },
      live: {
        type: "boolean",
        description: "Whether to connect in live mode (true) or test mode (false)",
        required: true,
        in: "body",
      },
      apiKey: {
        type: "string",
        description: "API key for the custom payment provider",
        required: true,
        in: "body",
      },
      publishableKey: {
        type: "string",
        description: "Publishable key for the custom payment provider",
        required: true,
        in: "body",
      },
    },
    body: ["locationId", "live", "apiKey", "publishableKey"],
  },

  {
    name: "crm_disconnect_custom_provider",
    description: "Disconnect a custom payment provider from a location.",
    method: "POST",
    path: "/payments/custom-provider/disconnect",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to disconnect the provider from",
        required: true,
        in: "body",
      },
      live: {
        type: "boolean",
        description: "Whether to disconnect from live mode (true) or test mode (false)",
        required: true,
        in: "body",
      },
    },
    body: ["locationId", "live"],
  },

  // ── Coupons ───────────────────────────────────────────────────

  {
    name: "crm_list_coupons",
    description: "List all coupons with optional pagination.",
    method: "GET",
    path: "/payments/coupons",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
      },
      limit: {
        type: "number",
        description: "Maximum number of coupons to return",
        required: false,
      },
      offset: {
        type: "number",
        description: "Number of coupons to skip for pagination",
        required: false,
      },
    },
    query: ["altId", "altType", "limit", "offset"],
  },

  {
    name: "crm_get_coupon",
    description: "Get a single coupon by ID.",
    method: "GET",
    path: "/payments/coupons/:couponId",
    params: {
      couponId: {
        type: "string",
        description: "The coupon ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_coupon",
    description: "Create a new coupon with discount configuration.",
    method: "POST",
    path: "/payments/coupons",
    params: {
      altId: {
        type: "string",
        description: "Alternative identifier (location ID)",
        required: true,
        in: "body",
      },
      altType: {
        type: "string",
        description: "Alternative ID type (e.g. 'location')",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Display name for the coupon",
        required: true,
        in: "body",
      },
      code: {
        type: "string",
        description: "Coupon code that customers enter to apply the discount",
        required: true,
        in: "body",
      },
      percentOff: {
        type: "number",
        description: "Percentage discount (0-100). Mutually exclusive with amountOff",
        required: false,
        in: "body",
      },
      amountOff: {
        type: "number",
        description: "Fixed amount discount in smallest currency unit. Mutually exclusive with percentOff",
        required: false,
        in: "body",
      },
      duration: {
        type: "string",
        description: "Duration of the coupon (e.g. 'once', 'repeating', 'forever')",
        required: false,
        in: "body",
      },
      durationInMonths: {
        type: "number",
        description: "Number of months the coupon applies when duration is 'repeating'",
        required: false,
        in: "body",
      },
      currency: {
        type: "string",
        description: "Currency code for the coupon (e.g. 'USD')",
        required: false,
        in: "body",
      },
      maxRedemptions: {
        type: "number",
        description: "Maximum number of times the coupon can be redeemed",
        required: false,
        in: "body",
      },
      productIds: {
        type: "array_string",
        description: "Array of product IDs the coupon applies to",
        required: false,
        in: "body",
      },
    },
    body: [
      "altId", "altType", "name", "code", "percentOff",
      "amountOff", "duration", "durationInMonths", "currency",
      "maxRedemptions", "productIds",
    ],
  },

  {
    name: "crm_update_coupon",
    description: "Update an existing coupon by ID.",
    method: "PUT",
    path: "/payments/coupons/:couponId",
    params: {
      couponId: {
        type: "string",
        description: "The coupon ID to update",
        required: true,
      },
    },
  },

  {
    name: "crm_delete_coupon",
    description: "Delete a coupon by ID.",
    method: "DELETE",
    path: "/payments/coupons/:couponId",
    params: {
      couponId: {
        type: "string",
        description: "The coupon ID to delete",
        required: true,
      },
    },
  },
];
