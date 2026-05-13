/**
 * config.js — Supply Chain Scenario Planner
 *
 * Base data constants extracted from the inline script.
 * Loaded as a global BASE_DATA array so other modules can reference the same
 * data without duplication.
 *
 * NOTE: This file is a reference extraction. index.html remains self-contained
 * (all logic is inline) to preserve the live GitHub Pages demo. These files
 * document the data and calculation logic for documentation and can serve as
 * the basis for a future modular build.
 */

/**
 * BASE_DATA — 8 diplomatic mission supply categories
 *
 * Each entry represents one supply category tracked by the planner.
 * Fields:
 *   name          {string}  Display name
 *   stock         {number}  Current on-hand quantity (units)
 *   reorderPoint  {number}  Trigger threshold for placing a new order (units)
 *   leadTimeDays  {number}  Days from order placement to receipt
 *   dailyDemand   {number}  Average units consumed per day (baseline)
 *   unitCost      {number}  Cost per unit in USD
 *   orderQty      {number}  Standard order quantity (units)
 */
const BASE_DATA = [
  { name: "Office Supplies",     stock: 450,  reorderPoint: 120,  leadTimeDays: 7,   dailyDemand: 18,   unitCost: 12,    orderQty: 300 },
  { name: "IT Equipment",        stock: 28,   reorderPoint: 10,   leadTimeDays: 21,  dailyDemand: 1.2,  unitCost: 850,   orderQty: 20  },
  { name: "Security Gear",       stock: 95,   reorderPoint: 30,   leadTimeDays: 14,  dailyDemand: 2.8,  unitCost: 220,   orderQty: 60  },
  { name: "Medical Supplies",    stock: 210,  reorderPoint: 75,   leadTimeDays: 10,  dailyDemand: 6.5,  unitCost: 45,    orderQty: 150 },
  { name: "Communication Equip", stock: 15,   reorderPoint: 8,    leadTimeDays: 28,  dailyDemand: 0.4,  unitCost: 1200,  orderQty: 12  },
  { name: "Vehicle Parts",       stock: 72,   reorderPoint: 25,   leadTimeDays: 18,  dailyDemand: 2.1,  unitCost: 380,   orderQty: 50  },
  { name: "Stationery/Forms",    stock: 890,  reorderPoint: 200,  leadTimeDays: 5,   dailyDemand: 32,   unitCost: 3,     orderQty: 600 },
  { name: "Facility Supplies",   stock: 340,  reorderPoint: 100,  leadTimeDays: 8,   dailyDemand: 11,   unitCost: 28,    orderQty: 250 },
];

/** Fixed ordering cost per purchase order (USD) */
const ORDERING_COST = 50;

/** Annual holding cost as a fraction of unit cost */
const HOLDING_RATE = 0.20;  // 20%

// Support both CommonJS (Node/test harness) and browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BASE_DATA, ORDERING_COST, HOLDING_RATE };
}
