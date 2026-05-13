# Project Plan — Supply Chain Scenario Planner

## Objective

Build an interactive browser-based tool that helps diplomatic mission supply chain managers model inventory risk under uncertainty. The tool applies classical operations research formulas (EOQ, ROP, stockout forecasting) and lets users explore how demand surges, lead time delays, and supply disruptions affect mission readiness.

---

## Scope

### In Scope
- EOQ-based optimal order quantity calculation (Wilson formula)
- Reorder point calculation with safety stock
- Days-until-stockout forecasting across item categories
- Interactive scenario multipliers (demand surge, lead time factor, disruption index)
- Per-category risk triage with color-coded status
- Static HTML dashboard — no backend, no database

### Out of Scope
- Real-time procurement data integration
- Multi-depot or multi-echelon network modeling
- Stochastic simulation (Monte Carlo)

---

## Architecture Decision

A single-file HTML dashboard was the correct initial choice for a course project with no institutional IT infrastructure. The production upgrade extracts all JavaScript logic into `src/js/` modules for maintainability without changing the deployment model — the dashboard still runs as a static file.

---

## File Structure

```
supply-chain-planner/
├── index.html              ← Dashboard entry (GitHub Pages)
├── src/js/
│   ├── config.js           ← Item catalog, cost parameters
│   ├── eoq.js              ← EOQ, ROP, stockout math
│   ├── simulation.js       ← Scenario application logic
│   └── charts.js           ← Chart.js initialization
├── docs/
│   ├── methodology.md
│   ├── architecture.md
│   ├── decision_log.md
│   └── data_dictionary.md
└── reports/
    ├── research_notes.md
    └── results.md
```

---

## Execution Phases

### Phase 1 — Core Logic (Complete)
- [x] EOQ formula implementation with Wilson derivation
- [x] Reorder point with safety stock multiplier
- [x] Days-until-stockout calculation
- [x] Scenario multiplier application

### Phase 2 — Structure Upgrade (Complete)
- [x] Extract JS to src/js/ modules
- [x] Write methodology, architecture, decision log, data dictionary
- [x] Write research notes and results report

---

## Success Criteria

- [x] Greedy algorithm correctly optimizes priority-weighted scheduling
- [x] src/js/ modules separated by concern (config, algorithm, charts)
- [x] All docs/ files contain real technical content, not filler
- [x] No AI-generated residue in any file
- [x] Dashboard continues to work after restructuring
