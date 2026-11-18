/**
 * simulation.js — Supply Chain Scenario Planner
 *
 * Scenario simulation logic: applies user-controlled parameters to BASE_DATA
 * and returns a computed scenario snapshot for rendering.
 *
 * Three core scenario controls:
 *   demandMult      — multiplier on daily demand (1.0x baseline to 3.0x spike)
 *   leadTimeExtra   — additional days added to all lead times (0–14 days)
 *   disruption      — if true, effective order replenishment quantities are cut by 40%
 *   safetyStockDays — optional buffer days of demand held as safety stock (default 0)
 *
 * Shared directly across browser runtime and Node.js automated test harnesses.
 */

/**
 * computeScenario(baseData, eoqValues, params)
 *
 * Applies scenario parameters to the base data and returns an array of
 * computed scenario rows, one per supply category.
 *
 * @param {object[]} baseData   - BASE_DATA array
 * @param {number[]} eoqValues  - pre-computed EOQ values (index-matched to baseData)
 * @param {{ demandMult?: number, leadTimeExtra?: number, disruption?: boolean, safetyStockDays?: number }} params
 * @returns {object[]} Array of scenario rows
 */
function computeScenario(baseData, eoqValues, params) {
  const p = params || {};
  const demandMult = typeof p.demandMult === 'number' ? p.demandMult : 1.0;
  const leadTimeExtra = typeof p.leadTimeExtra === 'number' ? p.leadTimeExtra : 0;
  const disruption = Boolean(p.disruption);
  const safetyStockDays = typeof p.safetyStockDays === 'number' ? p.safetyStockDays : 0;

  return baseData.map((item, i) => {
    // 1. Effective demand and lead time under scenario parameters
    const effectiveDemand = item.dailyDemand * demandMult;
    const effectiveLeadTime = item.leadTimeDays + leadTimeExtra;

    // 2. Disruption cuts replenishment order quantities by 40% (illustration only)
    // NOTE: This control illustrates supplier batch-size reduction. Because the tool evaluates
    // a single-period static snapshot of current stock vs. demand rate, downstream replenishment
    // shipment arrivals over time, lead-time pipeline inventory, and multi-period stock trajectories
    // are unmodeled. Consequently, effectiveOrderQty does not alter daysUntilStockout or statusKey.
    const effectiveOrderQty = disruption
      ? Math.round(item.orderQty * 0.6)
      : item.orderQty;

    // 3. Days of supply remaining at effective demand rate
    const daysUntilStockout = effectiveDemand > 0
      ? item.stock / effectiveDemand
      : Infinity;

    // 4. Safety stock buffer (units)
    const safetyStock = Math.ceil(effectiveDemand * safetyStockDays);

    // 5. Dynamic Effective Reorder Point:
    // Lead-time consumption plus safety buffer required under current scenario
    const effectiveReorderPoint = Math.ceil(effectiveDemand * effectiveLeadTime + safetyStock);

    // 6. Status classification
    // CRITICAL: Stock will run out before an order placed today can arrive (stockout inevitable without immediate action)
    // WARNING: Stock will last less than 1.5x effective lead time
    // OK: Stock covers at least 1.5x effective lead time
    let statusKey;
    if (daysUntilStockout < effectiveLeadTime) {
      statusKey = 'CRITICAL';
    } else if (daysUntilStockout < effectiveLeadTime * 1.5) {
      statusKey = 'WARNING';
    } else {
      statusKey = 'OK';
    }

    // 7. Dynamic reorder flag: item is below the required reorder threshold
    const isBelowReorder = item.stock < effectiveReorderPoint;

    return {
      ...item,
      effectiveDemand,
      effectiveLeadTime,
      effectiveOrderQty,
      daysUntilStockout,
      safetyStock,
      effectiveReorderPoint,
      isBelowReorder,
      statusKey,
      eoq: eoqValues[i],
    };
  });
}

/**
 * computeKPIs(rows, baseData)
 *
 * Derives dynamic KPI summary values from a scenario snapshot.
 *
 * @param {object[]} rows     - output of computeScenario()
 * @param {object[]} baseData - BASE_DATA (for static stock values)
 * @returns {{ belowReorder: number, totalValue: number, avgLeadTime: number, criticalCount: number, warningCount: number }}
 */
function computeKPIs(rows, baseData) {
  const belowReorder = rows.filter(r => r.isBelowReorder).length;
  const totalValue   = baseData.reduce((sum, r) => sum + r.stock * r.unitCost, 0);
  const avgLeadTime  = (
    rows.reduce((s, r) => s + r.effectiveLeadTime, 0) / rows.length
  ).toFixed(1);
  const criticalCount = rows.filter(r => r.statusKey === 'CRITICAL').length;
  const warningCount  = rows.filter(r => r.statusKey === 'WARNING').length;

  return {
    belowReorder,
    totalValue,
    avgLeadTime,
    criticalCount,
    warningCount,
  };
}

// Browser window global exposure
if (typeof window !== 'undefined') {
  window.computeScenario = computeScenario;
  window.computeKPIs = computeKPIs;
}

// CommonJS export for test harness
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeScenario, computeKPIs };
}
