// ============================================================
// 0nMCP — CRM Products & Prices API Tool Definitions
// ============================================================
// Data-driven tool definitions for the CRM Products API.
// Covers product CRUD and per-product price management
// including recurring billing, trials, inventory, and variants.
// ============================================================

export default [
  // ── Products ──────────────────────────────────────────────

  {
    name: "crm_list_products",
    description: "List products with optional search, pagination, and location filter.",
    method: "GET",
    path: "/products/",
    params: {
      locationId: { type: "string", description: "Location ID to list products for", required: true },
      limit: { type: "number", description: "Max number of products to return", required: false },
      offset: { type: "number", description: "Number of products to skip for pagination", required: false },
      search: { type: "string", description: "Search query to filter products by name", required: false },
    },
    query: ["locationId", "limit", "offset", "search"],
  },

  {
    name: "crm_get_product",
    description: "Get a single product by its ID.",
    method: "GET",
    path: "/products/:productId",
    params: {
      productId: { type: "string", description: "The product ID to retrieve", required: true },
    },
  },

  {
    name: "crm_create_product",
    description: "Create a new product.",
    method: "POST",
    path: "/products/",
    params: {
      locationId: { type: "string", description: "Location ID the product belongs to", required: true, in: "body" },
      name: { type: "string", description: "Product name", required: true, in: "body" },
      description: { type: "string", description: "Product description", required: false, in: "body" },
      productType: { type: "string", description: "Type of product (e.g. PHYSICAL, DIGITAL, SERVICE)", required: false, in: "body" },
      imageUrl: { type: "string", description: "URL of the product image", required: false, in: "body" },
      availableInStore: { type: "boolean", description: "Whether the product is available in the storefront", required: false, in: "body" },
      statementDescriptor: { type: "string", description: "Descriptor shown on billing statements", required: false, in: "body" },
      medias: { type: "array", description: "Array of media objects associated with the product", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "productType", "imageUrl", "availableInStore", "statementDescriptor", "medias"],
  },

  {
    name: "crm_update_product",
    description: "Update an existing product by its ID.",
    method: "PUT",
    path: "/products/:productId",
    params: {
      productId: { type: "string", description: "The product ID to update", required: true },
      locationId: { type: "string", description: "Location ID the product belongs to", required: false, in: "body" },
      name: { type: "string", description: "Product name", required: false, in: "body" },
      description: { type: "string", description: "Product description", required: false, in: "body" },
      productType: { type: "string", description: "Type of product (e.g. PHYSICAL, DIGITAL, SERVICE)", required: false, in: "body" },
      imageUrl: { type: "string", description: "URL of the product image", required: false, in: "body" },
      availableInStore: { type: "boolean", description: "Whether the product is available in the storefront", required: false, in: "body" },
      statementDescriptor: { type: "string", description: "Descriptor shown on billing statements", required: false, in: "body" },
      medias: { type: "array", description: "Array of media objects associated with the product", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "productType", "imageUrl", "availableInStore", "statementDescriptor", "medias"],
  },

  {
    name: "crm_delete_product",
    description: "Delete a product by its ID.",
    method: "DELETE",
    path: "/products/:productId",
    params: {
      productId: { type: "string", description: "The product ID to delete", required: true },
    },
  },

  // ── Prices ────────────────────────────────────────────────

  {
    name: "crm_list_prices",
    description: "List all prices for a specific product.",
    method: "GET",
    path: "/products/:productId/price",
    params: {
      productId: { type: "string", description: "The product ID to list prices for", required: true },
      locationId: { type: "string", description: "Location ID", required: true },
      limit: { type: "number", description: "Max number of prices to return", required: false },
      offset: { type: "number", description: "Number of prices to skip for pagination", required: false },
    },
    query: ["locationId", "limit", "offset"],
  },

  {
    name: "crm_get_price",
    description: "Get a single price by its ID for a product.",
    method: "GET",
    path: "/products/:productId/price/:priceId",
    params: {
      productId: { type: "string", description: "The product ID", required: true },
      priceId: { type: "string", description: "The price ID to retrieve", required: true },
    },
  },

  {
    name: "crm_create_price",
    description: "Create a new price for a product.",
    method: "POST",
    path: "/products/:productId/price",
    params: {
      productId: { type: "string", description: "The product ID to create the price for", required: true },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      name: { type: "string", description: "Price name / label", required: true, in: "body" },
      type: { type: "string", description: "Price type (e.g. one_time, recurring)", required: true, in: "body" },
      currency: { type: "string", description: "ISO 4217 currency code (e.g. USD)", required: true, in: "body" },
      amount: { type: "number", description: "Price amount in the smallest currency unit (e.g. cents)", required: true, in: "body" },
      recurring: { type: "object", description: "Recurring billing configuration object (interval, intervalCount)", required: false, in: "body" },
      description: { type: "string", description: "Price description", required: false, in: "body" },
      membershipOffers: { type: "array", description: "Array of membership offer objects tied to this price", required: false, in: "body" },
      trialPeriod: { type: "number", description: "Trial period in days before billing starts", required: false, in: "body" },
      totalCycles: { type: "number", description: "Total number of billing cycles (0 for unlimited)", required: false, in: "body" },
      setupFee: { type: "number", description: "One-time setup fee amount in the smallest currency unit", required: false, in: "body" },
      variantOptionIds: { type: "array", description: "Array of variant option IDs associated with this price", required: false, in: "body" },
      compareAtPrice: { type: "number", description: "Original / compare-at price for display purposes", required: false, in: "body" },
      trackInventory: { type: "boolean", description: "Whether to track inventory for this price", required: false, in: "body" },
      availableQuantity: { type: "number", description: "Available inventory quantity", required: false, in: "body" },
      allowOutOfStockPurchases: { type: "boolean", description: "Whether to allow purchases when out of stock", required: false, in: "body" },
    },
    body: [
      "locationId",
      "name",
      "type",
      "currency",
      "amount",
      "recurring",
      "description",
      "membershipOffers",
      "trialPeriod",
      "totalCycles",
      "setupFee",
      "variantOptionIds",
      "compareAtPrice",
      "trackInventory",
      "availableQuantity",
      "allowOutOfStockPurchases",
    ],
  },

  {
    name: "crm_update_price",
    description: "Update an existing price for a product.",
    method: "PUT",
    path: "/products/:productId/price/:priceId",
    params: {
      productId: { type: "string", description: "The product ID", required: true },
      priceId: { type: "string", description: "The price ID to update", required: true },
      locationId: { type: "string", description: "Location ID", required: false, in: "body" },
      name: { type: "string", description: "Price name / label", required: false, in: "body" },
      type: { type: "string", description: "Price type (e.g. one_time, recurring)", required: false, in: "body" },
      currency: { type: "string", description: "ISO 4217 currency code (e.g. USD)", required: false, in: "body" },
      amount: { type: "number", description: "Price amount in the smallest currency unit (e.g. cents)", required: false, in: "body" },
      recurring: { type: "object", description: "Recurring billing configuration object (interval, intervalCount)", required: false, in: "body" },
      description: { type: "string", description: "Price description", required: false, in: "body" },
      membershipOffers: { type: "array", description: "Array of membership offer objects tied to this price", required: false, in: "body" },
      trialPeriod: { type: "number", description: "Trial period in days before billing starts", required: false, in: "body" },
      totalCycles: { type: "number", description: "Total number of billing cycles (0 for unlimited)", required: false, in: "body" },
      setupFee: { type: "number", description: "One-time setup fee amount in the smallest currency unit", required: false, in: "body" },
      variantOptionIds: { type: "array", description: "Array of variant option IDs associated with this price", required: false, in: "body" },
      compareAtPrice: { type: "number", description: "Original / compare-at price for display purposes", required: false, in: "body" },
      trackInventory: { type: "boolean", description: "Whether to track inventory for this price", required: false, in: "body" },
      availableQuantity: { type: "number", description: "Available inventory quantity", required: false, in: "body" },
      allowOutOfStockPurchases: { type: "boolean", description: "Whether to allow purchases when out of stock", required: false, in: "body" },
    },
    body: [
      "locationId",
      "name",
      "type",
      "currency",
      "amount",
      "recurring",
      "description",
      "membershipOffers",
      "trialPeriod",
      "totalCycles",
      "setupFee",
      "variantOptionIds",
      "compareAtPrice",
      "trackInventory",
      "availableQuantity",
      "allowOutOfStockPurchases",
    ],
  },

  {
    name: "crm_delete_price",
    description: "Delete a price from a product.",
    method: "DELETE",
    path: "/products/:productId/price/:priceId",
    params: {
      productId: { type: "string", description: "The product ID", required: true },
      priceId: { type: "string", description: "The price ID to delete", required: true },
    },
  },
];
