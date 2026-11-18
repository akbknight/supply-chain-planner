/**
 * test_simulation.cjs — Scenario simulation & KPI consistency tests
 */

const assert = require('assert');
const { BASE_DATA, ORDERING_COST, HOLDING_RATE } = require('../src/js/config.js');
const { calculateEOQFromItem } = require('../src/js/eoq.js');
const { computeScenario, computeKPIs } = require('../src/js/simulation.js');

console.log('--- Running Supply Chain Simulation Tests ---');
let passed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

const EOQ_VALUES = BASE_DATA.map(item => calculateEOQFromItem(item, ORDERING_COST, HOLDING_RATE));

// 1. Baseline configuration integrity
it('Baseline configuration: reorder points satisfy deterministic lead-time demand', () => {
  BASE_DATA.forEach(item => {
    const leadTimeDemand = item.dailyDemand * item.leadTimeDays;
    assert(
      item.reorderPoint >= Math.ceil(leadTimeDemand),
      `Category ${item.name} ROP (${item.reorderPoint}) is less than lead-time demand (${leadTimeDemand})`
    );
    assert(
      item.stock >= item.reorderPoint,
      `Category ${item.name} baseline stock (${item.stock}) is below reorder point (${item.reorderPoint})`
    );
  });
});

// 2. Baseline scenario outputs
it('Baseline scenario (1.0x demand, +0 delay, no disruption) has 0 items below reorder and 0 critical', () => {
  const rows = computeScenario(BASE_DATA, EOQ_VALUES, { demandMult: 1.0, leadTimeExtra: 0, disruption: false });
  const kpis = computeKPIs(rows, BASE_DATA);

  assert.strictEqual(kpis.belowReorder, 0);
  assert.strictEqual(kpis.criticalCount, 0);
  assert.strictEqual(kpis.avgLeadTime, '13.9'); // (7+21+14+10+28+18+5+8)/8 = 111/8 = 13.875 -> 13.9
  assert.strictEqual(kpis.totalValue, 117100);
});

// 3. Demand surge simulation (2.0x demand spike)
it('Demand surge (2.0x): correctly identifies 3 critical stockout risks and 3 below reorder', () => {
  const rows = computeScenario(BASE_DATA, EOQ_VALUES, { demandMult: 2.0, leadTimeExtra: 0, disruption: false });
  const kpis = computeKPIs(rows, BASE_DATA);

  // IT Equipment (28 units vs 51 required), Comm Equip (15 vs 23), Vehicle Parts (72 vs 76)
  const criticalItems = rows.filter(r => r.statusKey === 'CRITICAL').map(r => r.name);
  assert.deepStrictEqual(criticalItems.sort(), ['Communication Equip', 'IT Equipment', 'Vehicle Parts'].sort());

  assert.strictEqual(kpis.criticalCount, 3);
  assert.strictEqual(kpis.belowReorder, 3);
  assert.strictEqual(kpis.warningCount, 1); // Security Gear is WARNING
});

// 4. Maximum stress simulation (3.0x demand spike, +14 days shipping delay)
it('Maximum stress (3.0x demand, +14d transit delay): tracks multi-category failure', () => {
  const rows = computeScenario(BASE_DATA, EOQ_VALUES, { demandMult: 3.0, leadTimeExtra: 14, disruption: true });
  const kpis = computeKPIs(rows, BASE_DATA);

  assert.strictEqual(kpis.avgLeadTime, '27.9'); // 13.875 + 14 = 27.875 -> 27.9
  assert(kpis.criticalCount >= 6, `Expected at least 6 critical items under max stress, got ${kpis.criticalCount}`);
  assert(kpis.belowReorder >= 6, `Expected at least 6 items below reorder under max stress, got ${kpis.belowReorder}`);
});

// 5. Supply disruption cuts replenishment quantity by 40%
it('Disruption toggle cuts replenishment batch sizes by 40%', () => {
  const normalRows = computeScenario(BASE_DATA, EOQ_VALUES, { disruption: false });
  const disruptRows = computeScenario(BASE_DATA, EOQ_VALUES, { disruption: true });

  normalRows.forEach((norm, i) => {
    const dis = disruptRows[i];
    assert.strictEqual(dis.effectiveOrderQty, Math.round(norm.orderQty * 0.6));
  });
});

// 6. Mathematical invariant: All CRITICAL items are strictly below effective reorder point
it('Deterministic invariant: Every CRITICAL item is below effective reorder point', () => {
  const testCases = [
    { demandMult: 1.0, leadTimeExtra: 0 },
    { demandMult: 1.5, leadTimeExtra: 3 },
    { demandMult: 2.0, leadTimeExtra: 7 },
    { demandMult: 2.8, leadTimeExtra: 10 },
    { demandMult: 3.0, leadTimeExtra: 14 },
  ];

  testCases.forEach(tc => {
    const rows = computeScenario(BASE_DATA, EOQ_VALUES, tc);
    rows.forEach(r => {
      if (r.statusKey === 'CRITICAL') {
        assert(
          r.isBelowReorder,
          `Item ${r.name} in scenario ${JSON.stringify(tc)} is CRITICAL but not flagged below reorder`
        );
      }
    });
  });
});

console.log(`\nAll ${passed} Supply Chain Simulation tests PASSED.`);
