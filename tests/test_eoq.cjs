/**
 * test_eoq.cjs — Unit tests for EOQ and reorder point inventory logic
 */

const assert = require('assert');
const { BASE_DATA, ORDERING_COST, HOLDING_RATE } = require('../src/js/config.js');
const {
  calculateEOQ,
  calculateEOQFromItem,
  calculateReorderPoint,
  calculateSafetyStock,
  calculateDaysUntilStockout,
  calculateStockoutRisk
} = require('../src/js/eoq.js');

console.log('--- Running EOQ & Inventory Unit Tests ---');
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

// 1. Analytical Wilson EOQ verification
it('Wilson EOQ analytical textbook calculation', () => {
  // D = 1000, S = $50, H = $2 -> Q* = sqrt((2 * 1000 * 50) / 2) = sqrt(50,000) = 223.606 -> 224
  assert.strictEqual(calculateEOQ(1000, 50, 2), 224);
});

it('Wilson EOQ handles zero/negative demand gracefully', () => {
  assert.strictEqual(calculateEOQ(0, 50, 2), 0);
  assert.strictEqual(calculateEOQ(-10, 50, 2), 0);
});

it('Wilson EOQ handles zero/negative holding cost gracefully', () => {
  assert.strictEqual(calculateEOQ(1000, 50, 0), 0);
  assert.strictEqual(calculateEOQ(1000, 50, -1), 0);
});

// 2. Exact EOQ calculations across all 8 BASE_DATA categories
const expectedEOQ = [523, 16, 48, 162, 8, 32, 1395, 268];

it('Calculates correct EOQ for all 8 base categories', () => {
  BASE_DATA.forEach((item, idx) => {
    const val = calculateEOQFromItem(item, ORDERING_COST, HOLDING_RATE);
    assert.strictEqual(val, expectedEOQ[idx], `Category ${item.name} EOQ mismatch`);
  });
});

// 3. Safety stock buffer calculation
it('Calculates safety stock covering buffer days', () => {
  assert.strictEqual(calculateSafetyStock(10, 2), 20);
  assert.strictEqual(calculateSafetyStock(1.2, 3), 4); // ceil(3.6) = 4
  assert.strictEqual(calculateSafetyStock(0, 5), 0);
  assert.strictEqual(calculateSafetyStock(10, 0), 0);
  assert.strictEqual(calculateSafetyStock(10, -2), 0);
});

// 4. Reorder point calculation
it('Calculates reorder point covering lead-time demand plus safety stock', () => {
  // Deterministic demand = 1.2 * 21 = 25.2 -> ceil is 26
  assert.strictEqual(calculateReorderPoint(1.2, 21, 0), 26);
  // With 5 units safety stock -> ceil(25.2 + 5) = 31
  assert.strictEqual(calculateReorderPoint(1.2, 21, 5), 31);
  // Zero demand/leadtime edge cases
  assert.strictEqual(calculateReorderPoint(0, 10, 5), 5);
  assert.strictEqual(calculateReorderPoint(10, 0, 8), 8);
});

// 5. Days until stockout
it('Calculates days until stockout and handles zero demand', () => {
  assert.strictEqual(calculateDaysUntilStockout(100, 10), 10);
  assert.strictEqual(calculateDaysUntilStockout(450, 18), 25);
  assert.strictEqual(calculateDaysUntilStockout(100, 0), Infinity);
  assert.strictEqual(calculateDaysUntilStockout(100, -5), Infinity);
});

// 6. Stockout risk classification thresholds
it('Classifies risk accurately: CRITICAL (< lead), WARNING (< 1.5x lead), OK (>= 1.5x lead)', () => {
  const leadTime = 10;
  // < 10 days
  assert.strictEqual(calculateStockoutRisk(9.9, leadTime), 'CRITICAL');
  assert.strictEqual(calculateStockoutRisk(5, leadTime), 'CRITICAL');
  // 10 to < 15 days
  assert.strictEqual(calculateStockoutRisk(10.0, leadTime), 'WARNING');
  assert.strictEqual(calculateStockoutRisk(14.9, leadTime), 'WARNING');
  // >= 15 days
  assert.strictEqual(calculateStockoutRisk(15.0, leadTime), 'OK');
  assert.strictEqual(calculateStockoutRisk(25, leadTime), 'OK');
});

console.log(`\nAll ${passed} EOQ & inventory unit tests PASSED.`);
