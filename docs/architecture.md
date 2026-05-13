# Architecture — Supply Chain Scenario Planner

## Overview

The application is a single-file browser dashboard (`index.html`) running entirely client-side. It uses an IIFE (Immediately Invoked Function Expression) to encapsulate all state and avoid polluting the global scope.

```
┌──────────────────────────────────────┐
│           Data Layer                 │
│  BASE_DATA (8 categories, static)   │
│  EOQ_VALUES (pre-computed, static)  │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│       Scenario State Layer           │
│  demandMult, leadTimeExtra,          │
│  disruption (mutated by UI events)  │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│       Computation Layer              │
│  computeScenario() → rows[]         │
│  EOQ, ROP, stockout, status         │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│       Rendering Layer                │
│  updateKPIs(), updateTable(),        │
│  updateChart(), buildEOQGrid()      │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│       UI / Event Layer               │
│  Sliders, toggle, DOM event         │
│  listeners                          │
└──────────────────────────────────────┘
```

---

## Data Model

### BASE_DATA Entry

```js
{
  name:          string,   // Display label
  stock:         number,   // Current units on hand
  reorderPoint:  number,   // Trigger threshold (units)
  leadTimeDays:  number,   // Days to receive an order
  dailyDemand:   number,   // Units consumed per day (baseline)
  unitCost:      number,   // USD per unit
  orderQty:      number,   // Standard order size
}
```

### Scenario Row (computeScenario output)

Extends BASE_DATA with scenario-adjusted derived values:

```js
{
  ...baseDataEntry,
  effectiveDemand:   number,                // dailyDemand * demandMult
  effectiveLeadTime: number,                // leadTimeDays + leadTimeExtra
  effectiveOrderQty: number,                // orderQty * (disruption ? 0.6 : 1.0)
  daysUntilStockout: number,                // stock / effectiveDemand
  statusKey:         'OK'|'WARNING'|'CRITICAL',
  eoq:               number,                // from EOQ_VALUES[i]
}
```

### EOQ_VALUES

Pre-computed at page load from BASE_DATA. Does not change with scenario parameters — EOQ reflects structural cost parameters, not operational conditions.

```js
EOQ_VALUES = BASE_DATA.map(item => Math.round(
  Math.sqrt((2 * item.dailyDemand * 365 * ORDERING_COST) / (item.unitCost * HOLDING_RATE))
))
```

---

## Computation Flow

```
init:
  EOQ_VALUES = BASE_DATA.map(computeEOQ)
  buildEOQGrid()   ← static, renders once
  render()

render():
  rows = computeScenario(demandMult, leadTimeExtra, disruption)
  updateKPIs(rows)
  updateTable(rows)
  updateChart(rows)

computeScenario():
  for each item in BASE_DATA:
    effectiveDemand   = dailyDemand * demandMult
    effectiveLeadTime = leadTimeDays + leadTimeExtra
    effectiveOrderQty = disruption ? orderQty * 0.6 : orderQty
    daysUntilStockout = stock / effectiveDemand
    statusKey         = classify(daysUntilStockout, effectiveLeadTime)
```

---

## Rendering Components

### KPI Cards

Four static HTML elements updated with `textContent`:
- `#kpi-skus` — always 8 (count of categories)
- `#kpi-below` — categories where `stock < reorderPoint` (scenario-independent)
- `#kpi-value` — total inventory value at base stock levels (scenario-independent)
- `#kpi-leadtime` — average base lead time (scenario-independent)

### Inventory Status Table

Rendered into `#inv-tbody` via `el()` helper (XSS-safe: uses `document.createTextNode`, no innerHTML with variable data). Rows color-coded by `statusKey`:
- `row-crit` → red left border
- `row-warn` → amber left border
- `row-ok` → green left border

### Stock Chart (Chart.js)

Grouped bar chart (`#stockChart`). Two datasets: current stock and reorder point. Created once on page load; updated on each scenario change via `stockChart.update('none')` to avoid re-animation.

Bar colors in the "Current Stock" dataset update dynamically with scenario status (green → amber → red as stock becomes critical).

### EOQ Grid

8-cell grid rendered once at init into `#eoq-grid`. Does not re-render on scenario changes because EOQ values are static.

---

## Event Architecture

All three scenario controls trigger `render()` on `input` / `change` events:

```
sliderDemand.addEventListener('input', () => {
  demandMult = parseFloat(sliderDemand.value);
  render();
});

sliderLead.addEventListener('input', () => {
  leadTimeExtra = parseInt(sliderLead.value);
  render();
});

toggleDisrupt.addEventListener('change', () => {
  disruption = toggleDisrupt.checked;
  render();
});
```

`render()` recomputes the full scenario on every control change. This is efficient because all computations are O(8) — 8 categories — and complete in microseconds.

---

## File Structure (Reference Extraction)

```
supply-chain-planner/
├── index.html              ← complete demo (self-contained, do not modify)
├── src/
│   └── js/
│       ├── config.js       ← BASE_DATA constant, ORDERING_COST, HOLDING_RATE
│       ├── eoq.js          ← EOQ, ROP, stockout, status calculations
│       ├── simulation.js   ← computeScenario(), computeKPIs()
│       └── charts.js       ← Chart.js initialization and update helpers
├── docs/
│   ├── methodology.md      ← EOQ derivation, scenario design
│   ├── architecture.md     ← this file
│   ├── decision_log.md     ← design decisions
│   └── data_dictionary.md  ← data schema reference
├── reports/
│   ├── research_notes.md   ← EOQ literature review
│   └── results.md          ← simulation results analysis
├── PROJECT_PLAN.md
├── FINAL_REVIEW.md
└── README.md
```
