# Final Review — Supply Chain Scenario Planner

## Summary

Interactive inventory management dashboard for diplomatic mission supply chains. Models Economic Order Quantity (EOQ), Reorder Point (ROP), and days-until-stockout across item categories. Users apply scenario multipliers to simulate demand surges, lead time delays, and supply disruptions in real time.

---

## What Was Built

### Core Logic
- **EOQ calculation**: Wilson formula (`EOQ = sqrt(2DS/H)`) — optimal order quantity minimizing total inventory cost
- **Reorder Point**: `ROP = (daily demand × lead time) + safety stock` — triggers replenishment before stockout
- **Days-until-stockout**: `current stock / daily demand` — real-time depletion forecasting
- **Scenario multipliers**: demand factor, lead time factor, disruption index applied multiplicatively to base parameters

### Production Structure
- `src/js/config.js` — item catalog with base demand, holding cost, ordering cost, current stock
- `src/js/eoq.js` — EOQ, ROP, stockout formulas with documented derivation
- `src/js/simulation.js` — scenario application, risk triage logic
- `src/js/charts.js` — Chart.js initialization (bar, doughnut, line charts)

### Documentation
- `docs/methodology.md` — EOQ derivation with full formula proof, ROP safety stock, scenario math
- `docs/architecture.md` — component diagram, data flow, design decisions
- `docs/decision_log.md` — why EOQ over stochastic models, why static HTML, why three scenario axes
- `docs/data_dictionary.md` — all item fields, scenario parameters, output metrics defined

### Reports
- `reports/research_notes.md` — Harris (1913) and Wilson (1934) original EOQ papers; inventory theory references
- `reports/results.md` — baseline EOQ outputs per item category, scenario sensitivity analysis

---

## Known Limitations

1. EOQ assumes constant demand — does not handle seasonal patterns
2. Safety stock formula uses a fixed multiplier rather than service level optimization
3. Single-location model — no multi-echelon or multi-depot support

---

## Deployment

Static GitHub Pages. `index.html` at root loads Chart.js from CDN. No server required.
