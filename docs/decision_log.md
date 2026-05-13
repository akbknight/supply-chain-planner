# Decision Log — Supply Chain Scenario Planner

## Decision 1: EOQ vs. More Advanced Inventory Models

**Decision:** Use the classic deterministic EOQ (Wilson formula) as the order quantity model.

**Context:**
Several inventory models were considered:

| Model | Description | Complexity |
|---|---|---|
| EOQ (chosen) | sqrt(2DS/H), constant demand | Low — closed-form formula |
| Safety stock EOQ | EOQ + z*σ_d*sqrt(L) | Medium — requires demand variance |
| Wagner-Whitin | Dynamic programming, time-varying demand | High — O(T²) algorithm |
| Silver-Meal heuristic | Rolling horizon, stochastic demand | Medium-high |
| (Q, r) continuous review | Probabilistic ROP with safety stock | Medium |

**Why EOQ:**
- **Closed-form optimal solution:** EOQ has an analytic minimum — no iteration or optimization required. This makes the underlying math directly explainable in the UI (the formula is displayed verbatim).
- **Portfolio clarity:** The goal is to demonstrate understanding of inventory cost trade-offs, not to implement a full stochastic demand model. EOQ is the canonical model for this purpose and is immediately recognizable to anyone with operations management background.
- **Appropriate for steady-state baseline:** The scenario controls add dynamic behavior (demand spikes, disruptions). EOQ provides the stable baseline against which scenarios are compared. Mixing a stochastic EOQ with stochastic scenario controls would make the demonstration harder to interpret.

**Trade-off accepted:** EOQ underestimates optimal order quantities when demand variance is high. The tool notes this limitation in docs/methodology.md and mentions safety stock as the natural extension.

---

## Decision 2: 8 Supply Categories

**Decision:** Use exactly 8 supply categories rather than more granular tracking.

**Context:**
Real diplomatic missions may track hundreds to thousands of line items. Options considered:
1. 3–4 categories: too sparse, misses variety
2. 8 categories (chosen): balanced
3. 20+ categories: too dense for a dashboard visualization

**Why 8:**
- The 8 categories cover three cost tiers and three lead time tiers, creating a meaningful spread of risk profiles in the table and chart.
- Chart.js grouped bar chart with 8 categories is readable on desktop and tablet. At 15+ categories, bar labels overlap even with rotation.
- 8 fits the 4-column EOQ grid perfectly (2 rows × 4 columns).
- The categories selected (office supplies, IT, security, medical, communication, vehicles, stationery, facility) represent the actual major supply domains in a diplomatic mission — the selection is defensible as realistic rather than arbitrary.

---

## Decision 3: Client-Side Only — No Backend

**Decision:** Run all calculations in the browser with no server component.

**Context:**
- Backend option: Node.js API computing EOQ and serving JSON; frontend fetches on each scenario change
- Client-side option (chosen): All data and logic in `index.html`

**Why client-side:**
- **Portability:** GitHub Pages serves static files. No server required.
- **Latency:** O(8) calculations run in microseconds. A round-trip to a server would add 50–200ms of latency with no benefit.
- **No data sensitivity concerns:** All data is synthetic. No need for auth, sessions, or secure transmission.
- **Simplicity:** The IIFE pattern keeps all state encapsulated. No build step, no bundler, no deploy pipeline.

---

## Decision 4: Scenario Controls Design

**Decision:** Three controls — demand multiplier (slider), lead time delay (slider), disruption (toggle).

**Context:**
More controls were considered: per-category demand overrides, individual lead time adjustments, unit cost inflation scenarios. These were rejected as too complex for a single-screen dashboard.

**Why these three:**
- **Demand multiplier:** The most operationally relevant scenario. Surge operations (visiting delegations, emergency evacuations) can double or triple daily consumption overnight.
- **Lead time delay:** Models supply chain risk (shipping disruptions, customs holds) without requiring the user to understand individual category lead times.
- **Disruption toggle:** A binary "vendor failure" switch creates a dramatically visible state change (order quantities drop 40%, many categories may go CRITICAL). The visual contrast makes the simulation feel interactive and meaningful.

The three controls are intentionally independent and additive — a user can combine all three simultaneously to model the worst-case "perfect storm" scenario.

---

## Decision 5: EOQ Grid Does Not Update with Scenario

**Decision:** The EOQ analysis panel displays static values computed from base data; it does not change when scenario controls are adjusted.

**Why:**
EOQ minimizes total *annual* cost based on structural parameters (ordering cost, holding rate, annual demand). It is not a real-time operational metric — it answers "what quantity should we routinely order?" not "what do we order right now?" The scenario controls affect short-term operational status (stockout risk), not the structural order sizing decision. Keeping EOQ static reinforces this conceptual distinction and avoids confusing the user about which metrics are scenario-dependent.
