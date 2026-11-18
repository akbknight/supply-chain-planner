/**
 * test_browser_parity.cjs — Parity & module binding tests
 *
 * Verifies that index.html loads the shared modular files, does not contain
 * obsolete duplicated definitions, and contains all expected UI IDs and structure.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- Running Browser Parity & Module Binding Tests ---');
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

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. Script tag inclusion
it('index.html includes script tags for config.js, eoq.js, and simulation.js', () => {
  assert(htmlContent.includes('<script src="src/js/config.js"></script>'), 'Missing config.js script tag');
  assert(htmlContent.includes('<script src="src/js/eoq.js"></script>'), 'Missing eoq.js script tag');
  assert(htmlContent.includes('<script src="src/js/simulation.js"></script>'), 'Missing simulation.js script tag');
});

// 2. No duplicated inline definitions
it('index.html inline script does not duplicate core data and functions', () => {
  // Should NOT contain inline redefinition of BASE_DATA array
  const matches = htmlContent.match(/const\s+BASE_DATA\s*=\s*\[/g);
  assert.strictEqual(matches, null, 'index.html should not duplicate const BASE_DATA = [...]');

  // Should NOT contain inline computeEOQ definition
  assert(!htmlContent.includes('function computeEOQ('), 'index.html should not define duplicate computeEOQ');

  // Should NOT contain inline computeScenario definition
  assert(!htmlContent.includes('function computeScenario('), 'index.html should not define duplicate computeScenario');
});

// 3. UI IDs and interactive controls
it('index.html contains all expected control IDs, KPI cards, and canvas', () => {
  const expectedIds = [
    'slider-demand',
    'slider-lead',
    'toggle-disruption',
    'demand-val',
    'lead-val',
    'disruption-status',
    'kpi-skus',
    'kpi-below',
    'kpi-value',
    'kpi-leadtime',
    'inv-table',
    'inv-tbody',
    'stockChart',
    'eoq-grid',
    'themeToggleBtn'
  ];

  expectedIds.forEach(id => {
    assert(
      htmlContent.includes(`id="${id}"`),
      `Expected index.html to contain element with id="${id}"`
    );
  });
});

// 4. Verification that window.chart is assigned for theme reactivity
it('index.html assigns window.chart and window.stockChart for theme reactivity', () => {
  assert(htmlContent.includes('window.chart = stockChart;'), 'Missing window.chart assignment');
  assert(htmlContent.includes('window.stockChart = stockChart;'), 'Missing window.stockChart assignment');
});

console.log(`\nAll ${passed} Browser Parity & Module Binding tests PASSED.`);
