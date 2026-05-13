/**
 * eoq.js — Supply Chain Scenario Planner
 *
 * Economic Order Quantity (EOQ) calculations and derived inventory metrics.
 *
 * All functions are pure (no side effects, no DOM access).
 *
 * References:
 *   Wilson, R.H. (1934). A scientific routine for stock control. Harvard Business Review.
 *   Harris, F.W. (1913). How many parts to make at once. Factory, The Magazine of Management.
 *
 * NOTE: This file is a reference extraction. index.html is self-contained.
 * See docs/methodology.md for full derivation and assumptions.
 */

/**
 * calculateEOQ — Economic Order Quantity (Wilson formula)
 *
 * Computes the order quantity that minimizes total annual inventory cost
 * (ordering cost + holding cost). Derivation:
 *
 *   Total Cost = (D/Q) * S + (Q/2) * H
 *   dTC/dQ = 0 → Q* = sqrt(2DS/H)
 *
 * Assumptions:
 *   - Demand D is constant and known
 *   - Replenishment is instantaneous (zero lead time for the EOQ calculation itself)
 *   - No stockouts permitted
 *   - Ordering cost S is fixed per order regardless of quantity
 *   - Holding cost H is linear in quantity
 *
 * @param {number} annualDemand  - D: annual units demanded (dailyDemand * 365)
 * @param {number} orderingCost  - S: fixed cost per order placed ($)
 * @param {number} holdingCost   - H: annual cost to hold one unit for one year ($)
 * @returns {number} Optimal order quantity (rounded to nearest integer)
 */
function calculateEOQ(annualDemand, orderingCost, holdingCost) {
  if (holdingCost <= 0 || annualDemand <= 0) return 0;
  return Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
}

/**
 * calculateEOQFromItem — Convenience wrapper for a BASE_DATA item
 *
 * Derives annualDemand from dailyDemand*365 and holdingCost from
 * unitCost * HOLDING_RATE.
 *
 * @param {{ dailyDemand: number, unitCost: number }} item
 * @param {number} orderingCost  - ORDERING_COST constant
 * @param {number} holdingRate   - HOLDING_RATE constant (e.g. 0.20)
 * @returns {number} EOQ (units)
 */
function calculateEOQFromItem(item, orderingCost, holdingRate) {
  const annualDemand = item.dailyDemand * 365;
  const holdingCost  = item.unitCost * holdingRate;
  return calculateEOQ(annualDemand, orderingCost, holdingCost);
}

/**
 * calculateReorderPoint — Demand-based reorder trigger
 *
 * ROP = average daily demand × lead time
 *
 * Interpretation: if stock falls to this level, place an order now and
 * inventory will reach zero just as the replenishment arrives (no safety stock).
 *
 * @param {number} dailyDemand   - average units consumed per day
 * @param {number} leadTimeDays  - days from order placement to receipt
 * @returns {number} Reorder point (units)
 */
function calculateReorderPoint(dailyDemand, leadTimeDays) {
  return dailyDemand * leadTimeDays;
}

/**
 * calculateDaysUntilStockout
 *
 * Given current stock and effective daily demand (which may be multiplied
 * by a scenario demand spike factor), returns the number of days until
 * inventory reaches zero.
 *
 * @param {number} currentStock      - units on hand
 * @param {number} effectiveDemand   - daily demand after scenario multiplier applied
 * @returns {number} Days until stockout (Infinity if demand is zero)
 */
function calculateDaysUntilStockout(currentStock, effectiveDemand) {
  if (effectiveDemand <= 0) return Infinity;
  return currentStock / effectiveDemand;
}

/**
 * calculateStockoutRisk — Status classification
 *
 * Compares days until stockout to the effective lead time to classify
 * supply status:
 *
 *   CRITICAL: A stockout will occur before any order placed today can arrive.
 *             Immediate action required.
 *   WARNING:  Stock will last less than 1.5× the lead time. Order should be
 *             placed soon.
 *   OK:       Adequate supply for the foreseeable replenishment cycle.
 *
 * @param {number} daysUntilStockout   - from calculateDaysUntilStockout()
 * @param {number} effectiveLeadTime   - lead time including any scenario delay
 * @returns {'CRITICAL'|'WARNING'|'OK'}
 */
function calculateStockoutRisk(daysUntilStockout, effectiveLeadTime) {
  if (daysUntilStockout < effectiveLeadTime) {
    return 'CRITICAL';
  } else if (daysUntilStockout < effectiveLeadTime * 1.5) {
    return 'WARNING';
  }
  return 'OK';
}

// CommonJS export for test harness
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateEOQ,
    calculateEOQFromItem,
    calculateReorderPoint,
    calculateDaysUntilStockout,
    calculateStockoutRisk,
  };
}
