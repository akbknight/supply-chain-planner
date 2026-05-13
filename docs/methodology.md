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
ROP = Daily Demand × Lead Time (days)
```

The values in BASE_DATA `reorderPoint` field are set to match this formula at baseline demand (no safety stock). This represents a lean policy — the mission assumes it can reliably receive orders within the stated lead time.

### Safety Stock Extension (not implemented)

In a more conservative model, safety stock (SS) would be added:

```
ROP = Daily Demand × Lead Time + Safety Stock
Safety Stock = z * σ_demand * sqrt(Lead Time)
```

where z is the service level factor (e.g., z=1.65 for 95% service level) and σ_demand is the standard deviation of daily demand. This is documented in Silver, Pyke & Peterson (1998) and is the natural next step for this model.

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

### 3. Supply Disruption Toggle

When activated, all `effectiveOrderQty` values are reduced by 40%, representing a partial vendor failure or transportation constraint. This does not directly affect stockout calculations (it models order fulfillment, not demand), but indicates that replenishment quantities will be smaller, requiring more frequent orders and increasing exposure to stockout risk between cycles.

---

## 8 Supply Categories — Design Rationale

The eight categories represent the major supply domains in a diplomatic mission:

| Category | Domain | Key Characteristics |
|---|---|---|
| Office Supplies | Administrative | High volume, low cost, short lead time |
| IT Equipment | Technology | Low volume, high cost, long lead time |
| Security Gear | Security | Moderate volume and cost, medium lead time |
| Medical Supplies | Medical/Welfare | Moderate volume, medium lead time, safety-critical |
| Communication Equip | Operations | Very low volume, very high cost, very long lead time |
| Vehicle Parts | Fleet | Moderate volume and cost, medium-long lead time |
| Stationery/Forms | Administrative | Very high volume, very low cost, short lead time |
| Facility Supplies | Maintenance | High volume, low-medium cost, short lead time |

The mix spans three cost tiers (low: <$50/unit, medium: $100–500, high: >$500) and three lead time tiers (short: ≤7 days, medium: 8–18 days, long: ≥21 days), creating a realistic spread of supply risk profiles.
