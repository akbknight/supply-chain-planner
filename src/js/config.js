/**
 * config.js — Supply Chain Scenario Planner
 *
 * Base data constants and configuration parameters for diplomatic mission logistics.
 * Shared directly across browser runtime and Node.js automated test harnesses.
 */

/**
 * BASE_DATA — 8 diplomatic mission supply categories (Synthetic Scenario Inputs)
 *
 * NOTE ON SYNTHETIC SCENARIO INPUT REVISIONS:
 * In the original synthetic scenario inputs, four categories had reorder points
 * dimensioned below deterministic lead-time demand (IT Equipment: 10 vs 25.2,
 * Security Gear: 30 vs 39.2, Communication Equip: 8 vs 11.2, Vehicle Parts: 25 vs 37.8).
 * Those original demonstration values are preserved in `legacyReorderPoint` for
 * comparative auditing.
 *
 * The active `reorderPoint` values reflect a revision to the synthetic demonstration inputs
 * ensuring reorderPoint >= ceil(dailyDemand * leadTimeDays), eliminating an internal
 * arithmetic inconsistency in the illustrative data. This change represents a revision of
 * synthetic demonstration inputs; it does NOT represent a measured operational improvement
 * on real-world systems.
 *
 * Fields:
 *   name                {string}  Display name
 *   stock               {number}  Current on-hand quantity (units)
 *   reorderPoint        {number}  Revised baseline trigger threshold (units)
 *   legacyReorderPoint  {number}  Original synthetic demonstration input (units)
 *   leadTimeDays        {number}  Days from order placement to receipt
 *   dailyDemand         {number}  Average units consumed per day (baseline)
 *   unitCost            {number}  Cost per unit in USD
 *   orderQty            {number}  Standard order quantity (units)
 */
const BASE_DATA = [
  { name: "Office Supplies",     stock: 450,  reorderPoint: 126, legacyReorderPoint: 120, leadTimeDays: 7,   dailyDemand: 18,   unitCost: 12,    orderQty: 300 },
  { name: "IT Equipment",        stock: 28,   reorderPoint: 26,  legacyReorderPoint: 10,  leadTimeDays: 21,  dailyDemand: 1.2,  unitCost: 850,   orderQty: 20  },
  { name: "Security Gear",       stock: 95,   reorderPoint: 40,  legacyReorderPoint: 30,  leadTimeDays: 14,  dailyDemand: 2.8,  unitCost: 220,   orderQty: 60  },
  { name: "Medical Supplies",    stock: 210,  reorderPoint: 75,  legacyReorderPoint: 75,  leadTimeDays: 10,  dailyDemand: 6.5,  unitCost: 45,    orderQty: 150 },
  { name: "Communication Equip", stock: 15,   reorderPoint: 12,  legacyReorderPoint: 8,   leadTimeDays: 28,  dailyDemand: 0.4,  unitCost: 1200,  orderQty: 12  },
  { name: "Vehicle Parts",       stock: 72,   reorderPoint: 38,  legacyReorderPoint: 25,  leadTimeDays: 18,  dailyDemand: 2.1,  unitCost: 380,   orderQty: 50  },
  { name: "Stationery/Forms",    stock: 890,  reorderPoint: 200, legacyReorderPoint: 200, leadTimeDays: 5,   dailyDemand: 32,   unitCost: 3,     orderQty: 600 },
  { name: "Facility Supplies",   stock: 340,  reorderPoint: 100, legacyReorderPoint: 100, leadTimeDays: 8,   dailyDemand: 11,   unitCost: 28,    orderQty: 250 },
];

/** Fixed ordering cost per purchase order (USD) */
const ORDERING_COST = 50;

/** Annual holding cost as a fraction of unit cost */
const HOLDING_RATE = 0.20;  // 20%

// Browser window global exposure
if (typeof window !== 'undefined') {
  window.BASE_DATA = BASE_DATA;
  window.ORDERING_COST = ORDERING_COST;
  window.HOLDING_RATE = HOLDING_RATE;
}

// Support both CommonJS (Node/test harness) and browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BASE_DATA, ORDERING_COST, HOLDING_RATE };
}
