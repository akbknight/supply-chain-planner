# Supply Chain Scenario Planner

A browser-based diplomatic logistics simulation tool that models inventory management for a multi-site mission. Tracks stock levels across eight supply categories, computes optimal order quantities using the Economic Order Quantity (EOQ) formula, forecasts stockout risk under normal and disrupted conditions, and lets analysts run interactive what-if scenarios.

All data is synthetic. No real operational information is contained in this project.

---

## Operational Context

Large-scale government and diplomatic operations require continuous tracking of consumable and durable goods across multiple locations. Supply categories range from low-cost, high-frequency items (office supplies, stationery) to high-cost, long-lead-time items (communication equipment, IT hardware). A stockout in any critical category can impair mission operations, while excess inventory ties up capital and storage capacity.

This tool mirrors the kind of inventory logic used in government logistics systems:

- Reorder point triggers based on lead time and daily consumption rate
- EOQ-based order sizing to balance ordering frequency against holding costs
- Stockout risk forecasting by comparing days of supply remaining against effective lead time
- Scenario planning for demand surges, supply chain delays, and vendor disruptions

The simulation is intentionally simplified to demonstrate core supply chain concepts. It does not model safety stock, stochastic demand, multi-echelon networks, or vendor-specific constraints.

---

## Algorithms

### Reorder Point

A reorder is needed when inventory on hand falls to or below the quantity that will be consumed during the replenishment lead time:

```
Baseline Reorder Point = ceil( Daily Demand * Lead Time (days) )
Effective Reorder Point = ceil( Effective Daily Demand * Effective Lead Time + Safety Stock )
```

**Revision of Synthetic Demonstration Inputs:**
In the original synthetic scenario inputs, four categories had reorder points dimensioned below deterministic lead-time demand ($d \times L > R$: IT Equipment $25.2 > 10$, Security Gear $39.2 > 30$, Communication Equip $11.2 > 8$, Vehicle Parts $37.8 > 25$), guaranteeing stockout before replenishment arrival under nominal baseline conditions. Baseline reorder points were revised to satisfy deterministic replenishment lead-time demand ($R \ge \lceil d \times L \rceil$). The original demonstration values are preserved in the data and documentation (`legacyReorderPoint`) for comparative auditing. This change represents a revision to synthetic scenario inputs; it does **not** represent or imply a measured operational improvement on real-world systems.

Under scenario adjustments (demand surges and lead time delays), effective reorder points scale dynamically, ensuring that the "Below Reorder Point" KPI card and status indicators remain mathematically consistent with projected stockout risks.

### Safety Stock & Service-Level Boundary

The safety stock buffer function (`calculateSafetyStock`) provides a simple deterministic heuristic (`dailyDemand * bufferDays`). It does **not** provide, calculate, or imply a statistical service-level guarantee (such as a 95% or 99% cycle service level). A mathematically sound service-level guarantee requires an empirical demand distribution, lead-time variance distribution, and continuous convolution ($z \cdot \sigma_L$).

### Days Until Stockout

Given a demand multiplier applied by the scenario controls:

```
Days Until Stockout = Current Stock / (Daily Demand * Demand Multiplier)
```

### Status Classification

Status is assigned by comparing days of supply remaining to the effective lead time (base lead time plus any scenario delay):

| Status   | Condition                                         |
|----------|---------------------------------------------------|
| CRITICAL | Days Until Stockout < Effective Lead Time         |
| WARNING  | Days Until Stockout < Effective Lead Time * 1.5  |
| OK       | All other cases                                   |

A CRITICAL status means a stockout will occur before a replenishment order can arrive even if placed today.

### Economic Order Quantity (EOQ)

EOQ minimizes the sum of ordering costs and annual inventory holding costs:

```
EOQ = sqrt( (2 * D * S) / H )
```

Where:

- `D` = Annual demand (Daily Demand * 365)
- `S` = Fixed ordering cost per order ($50, illustrative)
- `H` = Annual holding cost per unit (20% of unit cost)

EOQ values are computed from base data and do not change with scenario adjustments, since they reflect structural cost parameters rather than short-term conditions.

### Supply Disruption Scenario (Replenishment-Quantity Illustration)

When the disruption toggle is active, `effectiveOrderQty` is reduced by 40%, illustrating a partial vendor allocation constraint or supplier batch reduction.

**Unmodeled Downstream Effects Boundary:**
Because the planner models a **single-period static inventory snapshot**, downstream replenishment shipment arrivals over time, in-transit purchase order pipelines, and subsequent multi-period inventory trajectories are unmodeled. Consequently, the disruption control is an illustrative batch-size demonstration and does **not** alter stockout timing (`daysUntilStockout`) or status classifications (`CRITICAL`/`WARNING`/`OK`).

---

## Supply Categories (Synthetic Scenario Data)

| Category            | Stock | Revised ROP | Legacy ROP (Original Input) | Lead Time | Daily Demand | Unit Cost |
|---------------------|-------|-------------|-----------------------------|-----------|--------------|-----------|
| Office Supplies     | 450   | 126         | 120                         | 7 days    | 18 units     | $12       |
| IT Equipment        | 28    | 26          | 10                          | 21 days   | 1.2 units    | $850      |
| Security Gear       | 95    | 40          | 30                          | 14 days   | 2.8 units    | $220      |
| Medical Supplies    | 210   | 75          | 75                          | 10 days   | 6.5 units    | $45       |
| Communication Equip | 15    | 12          | 8                           | 28 days   | 0.4 units    | $1,200    |
| Vehicle Parts       | 72    | 38          | 25                          | 18 days   | 2.1 units    | $380      |
| Stationery/Forms    | 890   | 200         | 200                         | 5 days    | 32 units     | $3        |
| Facility Supplies   | 340   | 100         | 100                         | 8 days    | 11 units     | $28       |

---

## Features

- Real-time scenario simulation with three interactive controls
- Demand Spike slider (1x to 3x multiplier) to model surge conditions
- Lead Time Delay slider (0 to +14 days) to model transportation or customs delays
- Supply Disruption toggle to model partial vendor failure (40% order quantity reduction)
- Inventory status table with per-row color coding (CRITICAL / WARNING / OK)
- Grouped bar chart showing current stock against reorder threshold per category
- EOQ analysis panel with computed optimal order quantities and underlying parameters
- KPI summary row: total SKUs, categories below reorder point, total inventory value, average lead time

---

## How to Run

No build step or server required.

1. Clone or download the repository
2. Open `index.html` in any modern browser
3. Interact with the scenario controls to explore different supply chain conditions

The project is also deployable directly to GitHub Pages by enabling Pages on the repository root.

---

## Verification & Automated Testing

The project includes automated test coverage across unit calculations, scenario simulations, browser DOM parity, and headless Chrome browser execution:

```bash
# Run unit tests, scenario simulations, and HTML module parity checks
npm test

# Run headless Google Chrome browser smoke test with visual screenshot capture
npm run test:browser
```

- **`tests/test_eoq.cjs`**: Verifies analytical Wilson formula derivations, zero/negative parameter guards, exact integer outputs across all 8 base categories, safety stock buffers, and stockout risk thresholds.
- **`tests/test_simulation.cjs`**: Verifies deterministic lead-time coverage invariants ($R \ge \lceil d \times L \rceil$), demand surge and transit delay scaling, supply disruption order quantity cuts (40%), and dynamic KPI consistency.
- **`tests/test_browser_parity.cjs`**: Verifies `index.html` loads shared modular scripts (`config.js`, `eoq.js`, `simulation.js`), asserts absence of duplicate inline definitions, and checks presence of all interactive DOM controls.
- **`tests/test_browser_smoke.cjs`**: Launches headless Google Chrome via Puppeteer Core, loads `index.html`, asserts 0 page/console errors, exercises demand surge and transit delay sliders, toggles supply disruption and themes, and verifies reactive DOM re-rendering.

---

## Tech Stack

- HTML5, CSS3, vanilla JavaScript (ES2020+)
- Chart.js 4 (loaded via CDN, no local dependency)
- Google Fonts: Inter (UI), IBM Plex Mono (numeric data)
- No frameworks, no build tools, no runtime dependencies

---

## Design

Dark dashboard aesthetic: background #0d0d0d, amber gold accent #E8A020, monospaced numerics for data density. Responsive layout supports desktop, tablet, and mobile viewports. All DOM manipulation is XSS-safe (no innerHTML with variable data).

---

## Retained Analytical Boundaries & Scoped Assumptions

The following operational and mathematical boundaries are explicitly scoped and retained:

1. **Unmodeled Replenishment Dynamics & Multi-Period Stock Trajectories**: The disruption toggle illustrates a 40% batch reduction on purchase order sizing. Because this simulation evaluates a single-period static snapshot of current on-hand stock against daily consumption rates, replenishment transit pipelines, order receipt arrivals over time, and subsequent post-arrival inventory trajectories are unmodeled.
2. **Static Inventory-Position Assumptions**: Stock is modeled strictly as current on-hand quantity ($S$). The planner does not account for open purchase orders in transit, vendor backorders, safety stock allocations reserved for emergency tranches, or scrap/spoilage.
3. **Deterministic Lead Times & Demand**: Daily demand and replenishment lead times are treated as deterministic scalar constants. The tool does not model stochastic lead-time distributions, demand variance, seasonal covariance matrices, or customs detention probability densities.
4. **Decoupled Single-Item Heuristics vs. Global Optimization**: Order quantities (Wilson EOQ) and reorder triggers are computed via decentralized single-item formulas without multi-echelon inventory optimization (MEIO) or mixed-integer linear programming (MILP) under aggregate budgetary or cargo-volume constraints.

---

## Disclaimer

All data in this project is synthetic and illustrative. This tool does not contain, represent, or derive from any real government, diplomatic, or operational supply chain data. Built for portfolio and educational purposes.

---

Built by Akshay Kumar — [akbknight.github.io](https://akbknight.github.io)
