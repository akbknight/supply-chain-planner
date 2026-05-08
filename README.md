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
Reorder Point = Daily Demand * Lead Time (days)
```

The embedded reorder points in the data reflect this baseline without safety stock.

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

### Supply Disruption Scenario

When the disruption toggle is active, all effective order quantities are reduced by 40%, representing a partial vendor failure or transportation constraint. This does not affect stockout calculations directly but indicates that replenishment quantities will be smaller than planned, increasing reorder frequency.

---

## Supply Categories (Synthetic Data)

| Category            | Stock | Reorder Point | Lead Time | Daily Demand | Unit Cost |
|---------------------|-------|---------------|-----------|--------------|-----------|
| Office Supplies     | 450   | 120           | 7 days    | 18 units     | $12       |
| IT Equipment        | 28    | 10            | 21 days   | 1.2 units    | $850      |
| Security Gear       | 95    | 30            | 14 days   | 2.8 units    | $220      |
| Medical Supplies    | 210   | 75            | 10 days   | 6.5 units    | $45       |
| Communication Equip | 15    | 8             | 28 days   | 0.4 units    | $1,200    |
| Vehicle Parts       | 72    | 25            | 18 days   | 2.1 units    | $380      |
| Stationery/Forms    | 890   | 200           | 5 days    | 32 units     | $3        |
| Facility Supplies   | 340   | 100           | 8 days    | 11 units     | $28       |

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

## Tech Stack

- HTML5, CSS3, vanilla JavaScript (ES2020+)
- Chart.js 4 (loaded via CDN, no local dependency)
- Google Fonts: Inter (UI), IBM Plex Mono (numeric data)
- No frameworks, no build tools, no runtime dependencies

---

## Design

Dark dashboard aesthetic: background #0d0d0d, amber gold accent #E8A020, monospaced numerics for data density. Responsive layout supports desktop, tablet, and mobile viewports. All DOM manipulation is XSS-safe (no innerHTML with variable data).

---

## Disclaimer

All data in this project is synthetic and illustrative. This tool does not contain, represent, or derive from any real government, diplomatic, or operational supply chain data. Built for portfolio and educational purposes.

---

Built by Akshay Kumar — [akbknight.github.io](https://akbknight.github.io)
