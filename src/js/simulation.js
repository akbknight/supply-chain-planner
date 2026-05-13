/**
 * simulation.js — Supply Chain Scenario Planner
 *
 * Scenario simulation logic: applies user-controlled parameters to BASE_DATA
 * and returns a computed scenario snapshot for rendering.
 *
 * Three scenario controls:
 *   demandMult    — multiplier on daily demand (1.0x baseline to 3.0x spike)
 *   leadTimeExtra — additional days added to all lead times (0–14 days)
 *   disruption    — if true, effective order quantities are cut by 40%
 *
 * NOTE: This file is a reference extraction. index.html is self-contained.
 * See docs/methodology.md for scenario design rationale.
 */

/**
 * computeScenario(baseData, eoqValues, params)
 *
 * Applies scenario parameters to the base data and returns an array of
 * computed scenario rows, one per supply category.
 *
 * @param {object[]} baseData   - BASE_DATA array
 * @param {number[]} eoqValues  - pre-computed EOQ values (index-matched to baseData)
 * @param {{ demandMult: number, leadTimeExtra: number, disruption: boolean }} params
 * @returns {object[]} Array of scenario rows
 */
function computeScenario(baseData, eoqValues, params) {
  const { demandMult, leadTimeExtra, disruption } = params;

  return baseData.map((item, i) => {
    // Apply demand multiplier
    const effectiveDemand = item.dailyDemand * demandMult;

    // Apply lead time delay
    const effectiveLeadTime = item.leadTimeDays + leadTimeExtra;

    // Apply disruption (reduces available order qty by 40%)
    const effectiveOrderQty = disruption
      ? Math.round(item.orderQty * 0.6)
      : item.orderQty;

    // Days of supply remaining at effective demand rate
    const daysUntilStockout = effectiveDemand > 0
      ? item.stock / effectiveDemand
      : Infinity;

    // Status classification
    let statusKey;
    if (daysUntilStockout < effectiveLeadTime) {
      statusKey = 'CRITICAL';
    } else if (daysUntilStockout < effectiveLeadTime * 1.5) {
      statusKey = 'WARNING';
    } else {
      statusKey = 'OK';
    }

    return {
      ...item,
      effectiveDemand,
      effectiveLeadTime,
      effectiveOrderQty,
      daysUntilStockout,
      statusKey,
      eoq: eoqValues[i],
    };
  });
}

/**
 * computeKPIs(rows, baseData)
 *
 * Derives KPI values from a scenario snapshot.
 *
 * @param {object[]} rows     - output of computeScenario()
 * @param {object[]} baseData - BASE_DATA (for static values like base stock)
 * @returns {{ belowReorder: number, totalValue: number, avgLeadTime: number }}
 */
function computeKPIs(rows, baseData) {
  const belowReorder = rows.filter(r => r.stock < r.reorderPoint).length;
  const totalValue   = baseData.reduce((sum, r) => sum + r.stock * r.unitCost, 0);
  const avgLeadTime  = (
    baseData.reduce((s, r) => s + r.leadTimeDays, 0) / baseData.length
  ).toFixed(1);

  return { belowReorder, totalValue, avgLeadTime };
}

// CommonJS export for test harness
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeScenario, computeKPIs };
}
