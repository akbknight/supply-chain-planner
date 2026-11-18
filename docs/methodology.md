# Methodology — Supply Chain Scenario Planner

## Overview

This tool models inventory management for a diplomatic mission using three classical supply chain formulas: the **Economic Order Quantity (EOQ)** model for optimal order sizing, the **Reorder Point (ROP)** for triggering replenishment, and **days-until-stockout** for real-time risk forecasting. Users can apply scenario multipliers to explore how demand surges, lead time delays, and supply disruptions affect mission-critical supply status.

---

## Economic Order Quantity (EOQ)

### Historical Context

The EOQ formula was independently derived by Harris (1913) and Wilson (1934) and remains one of the most widely used operations research results. It solves the fundamental inventory trade-off: ordering less frequently reduces ordering costs but increases holding costs; ordering more frequently does the reverse.

### Wilson Formula Derivation

Let:
- D = annual demand (units/year)
- S = ordering cost ($/order) — fixed regardless of quantity
- H = annual holding cost per unit ($/unit/year)
- Q = order quantity (units)

**Total annual inventory cost:**

```
TC(Q) = (D / Q) * S   +   (Q / 2) * H
         ───────────       ───────────
         ordering cost     holding cost
```

- (D/Q) = number of orders per year
- (Q/2) = average inventory level (assuming constant demand and instantaneous replenishment)

**Minimize by differentiating with respect to Q and setting to zero:**

```
dTC/dQ = -DS/Q² + H/2 = 0
→ Q² = 2DS/H
→ Q* = sqrt(2DS/H)   ← EOQ
```

### Application in This Tool

```
EOQ = sqrt( 2 * D * S / H )

where:
  D = dailyDemand * 365       (annualized)
  S = $50                     (fixed ordering cost, illustrative)
  H = unitCost * 0.20         (20% of unit cost per year)
```

EOQ values are computed once from base data and do not change with scenario parameters. This reflects the model assumption that EOQ depends on structural cost parameters (order cost, holding rate), not short-term conditions. A demand spike changes *when* to reorder (ROP), not *how much* to order (EOQ).

### Assumptions and Limitations

| Assumption | Reality |
|---|---|
| Constant, known demand | Demand varies; this model uses a deterministic baseline |
| Instantaneous replenishment | Real lead times are modeled separately via ROP |
| No stockouts | Relaxed by the scenario's CRITICAL/WARNING system |
| Single item, no MOQ | Real procurement often has minimum order quantities |
| Linear holding cost | Storage costs may have step functions (e.g., new warehouse) |

---

## Reorder Point (ROP)

The reorder point is the stock level at which a new order must be placed to avoid a stockout during the replenishment lead time:

```
Baseline ROP = ceil( Daily Demand × Lead Time )
Effective Scenario ROP = ceil( Effective Demand × Effective Lead Time + Safety Stock )
```

### Synthetic Scenario Input Revisions & Comparative Baseline

In the original synthetic demonstration inputs, four categories had reorder points set below deterministic lead-time demand:
- IT Equipment: $10$ vs. $25.2$ units ($1.2 \times 21$)
- Security Gear: $30$ vs. $39.2$ units ($2.8 \times 14$)
- Communication Equip: $8$ vs. $11.2$ units ($0.4 \times 28$)
- Vehicle Parts: $25$ vs. $37.8$ units ($2.1 \times 18$)

Under those original inputs, placing an order at the reorder point would guarantee a stockout before delivery even under nominal baseline demand. Baseline reorder points were revised in `BASE_DATA` to satisfy deterministic replenishment coverage ($\text{ROP} \ge \lceil d \times L \rceil$). The original demonstration values are preserved as `legacyReorderPoint` in the dataset for comparative auditing. This change represents an internal consistency revision to synthetic scenario inputs, **not** a measured operational improvement on live operations.

Under scenario execution, `computeScenario` calculates the dynamic `effectiveReorderPoint`. This ensures that when demand surges or transit delays occur, both the inventory status table and the "Below Reorder Point" KPI card evaluate the scenario-adjusted lead-time requirements rather than a frozen nominal baseline.

### Safety Stock & Service-Level Boundary

In addition to deterministic lead-time coverage, `src/js/eoq.js` provides `calculateSafetyStock(dailyDemand, bufferDays)` to size an illustrative buffer covering a specified number of days of daily demand:

```
ROP = ceil( Daily Demand × Lead Time + Safety Stock )
Safety Stock = ceil( Daily Demand × Buffer Days )
```

**Scope Boundary:** This buffer-day calculation is a deterministic heuristic. It does **not** provide, calculate, or guarantee a specific statistical service level (e.g. 95% or 99% cycle service level). Establishing a mathematically sound service-level guarantee requires an empirical demand distribution, lead-time variance distribution, and continuous convolution ($z \cdot \sigma_L$).

---

## Days Until Stockout

```
Days Until Stockout = Current Stock / Effective Daily Demand
```

where `Effective Daily Demand = dailyDemand * demandMult` (scenario-adjusted).

This is the number of days remaining before inventory hits zero if no replenishment arrives. It is compared against the effective lead time (base lead time + any scenario delay) to classify supply status.

---

## Status Thresholds

| Status | Condition | Interpretation |
|---|---|---|
| CRITICAL | DaysUntilStockout < EffectiveLeadTime | A stockout will occur before any order placed today can arrive |
| WARNING | DaysUntilStockout < EffectiveLeadTime × 1.5 | Margin is thin; an order should be placed now |
| OK | All other cases | Adequate supply for the replenishment cycle |

The 1.5× WARNING threshold provides a buffer: if lead time is 14 days and you have 18 days of supply, you are technically not yet in stockout territory, but the margin is too small to absorb any disruption. This mirrors standard inventory practice of maintaining a "safety cushion" above the strict ROP.

---

## Scenario Modeling

Three interactive scenario controls allow analysts to stress-test the baseline inventory picture:

### 1. Demand Spike Multiplier (1.0× to 3.0×)

Multiplies `dailyDemand` for all categories by the selected factor. Represents:
- Surge operations (visiting delegation, emergency response, election monitoring)
- Seasonal consumption increases
- Data errors or demand forecast revisions

Effect on outputs:
- `effectiveDemand` increases → `daysUntilStockout` decreases → more categories hit CRITICAL/WARNING

### 2. Lead Time Delay (+0 to +14 days)

Adds the selected number of days to `leadTimeDays` for all categories. Represents:
- Customs or port clearance delays
- Shipping disruptions (weather, labor action)
- Supplier backlog

Effect on outputs:
- `effectiveLeadTime` increases → the CRITICAL/WARNING threshold rises → categories that were OK may become WARNING

Note: lead time delay and demand spike compound. A 2× demand spike combined with +7 days lead time delay can push most categories to CRITICAL simultaneously — the "worst case" scenario for mission logistics planning.

### 3. Supply Disruption Toggle (Replenishment-Quantity Illustration)

When activated, all `effectiveOrderQty` values are reduced by 40%, representing an illustrative partial vendor allocation or order cut.

**Unmodeled Replenishment Dynamics Boundary:**
This tool evaluates a **single-period static inventory snapshot**. Downstream replenishment shipment arrivals over time, order fulfillment pipelines, and subsequent multi-period inventory trajectories are unmodeled. Consequently, this control illustrates order batch-size reduction and does **not** alter stockout timing (`daysUntilStockout`) or status classifications (`CRITICAL`/`WARNING`/`OK`).

---

## 8 Supply Categories — Design Rationale

The eight categories represent the major supply domains in a diplomatic mission:

| Category | Domain | Revised ROP | Legacy ROP (Original Input) | Key Characteristics |
|---|---|---|---|---|
| Office Supplies | Administrative | 126 | 120 | High volume, low cost, short lead time |
| IT Equipment | Technology | 26 | 10 | Low volume, high cost, long lead time |
| Security Gear | Security | 40 | 30 | Moderate volume and cost, medium lead time |
| Medical Supplies | Medical/Welfare | 75 | 75 | Moderate volume, medium lead time, safety-critical |
| Communication Equip | Operations | 12 | 8 | Very low volume, very high cost, very long lead time |
| Vehicle Parts | Fleet | 38 | 25 | Moderate volume and cost, medium-long lead time |
| Stationery/Forms | Administrative | 200 | 200 | Very high volume, very low cost, short lead time |
| Facility Supplies | Maintenance | 100 | 100 | High volume, low-medium cost, short lead time |

The mix spans three cost tiers (low: <$50/unit, medium: $100–500, high: >$500) and three lead time tiers (short: ≤7 days, medium: 8–18 days, long: ≥21 days), creating a realistic spread of supply risk profiles.

---

## Retained Analytical Boundaries

The following analytical boundaries are explicitly scoped and retained:

1. **Unmodeled Replenishment Dynamics**: Replenishment arrivals and dynamic multi-period inventory trajectories are not simulated; disruption is an order-sizing demonstration.
2. **Static Inventory-Position Assumptions**: Stock reflects current on-hand quantities without open order tracking, pipeline inventory, backorders, or multi-echelon network positions.
3. **Deterministic Lead Times & Demand**: Lead times and demand rates are scalar constants without stochastic variance distributions.
4. **Local Heuristics vs. Global Optimization**: Decentralized single-item Wilson EOQ / ROP without multi-echelon inventory optimization (MEIO) or mixed-integer linear programming (MILP).
