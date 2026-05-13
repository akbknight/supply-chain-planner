# Data Dictionary — Supply Chain Scenario Planner

All data is synthetic and illustrative. No real operational information is contained in this project.

---

## BASE_DATA Fields

Each entry in the BASE_DATA array represents one supply category.

| Field | Type | Unit | Description |
|---|---|---|---|
| `name` | string | — | Display name of the supply category |
| `stock` | number | units | Current on-hand inventory quantity |
| `reorderPoint` | number | units | Inventory level at which a replenishment order should be placed; set to `dailyDemand × leadTimeDays` (no safety stock) |
| `leadTimeDays` | number | days | Days from order placement to receipt of goods |
| `dailyDemand` | number | units/day | Average baseline daily consumption rate |
| `unitCost` | number | USD | Cost per unit |
| `orderQty` | number | units | Standard quantity per order |

---

## BASE_DATA Values

| Category | Stock | ROP | Lead Time | Daily Demand | Unit Cost | Order Qty |
|---|---|---|---|---|---|---|
| Office Supplies | 450 | 120 | 7 days | 18 units/day | $12 | 300 |
| IT Equipment | 28 | 10 | 21 days | 1.2 units/day | $850 | 20 |
| Security Gear | 95 | 30 | 14 days | 2.8 units/day | $220 | 60 |
| Medical Supplies | 210 | 75 | 10 days | 6.5 units/day | $45 | 150 |
| Communication Equip | 15 | 8 | 28 days | 0.4 units/day | $1,200 | 12 |
| Vehicle Parts | 72 | 25 | 18 days | 2.1 units/day | $380 | 50 |
| Stationery/Forms | 890 | 200 | 5 days | 32 units/day | $3 | 600 |
| Facility Supplies | 340 | 100 | 8 days | 11 units/day | $28 | 250 |

---

## Global Constants

| Constant | Value | Description |
|---|---|---|
| `ORDERING_COST` | $50 | Fixed cost per purchase order, regardless of quantity. Illustrative; real ordering costs include procurement staff time, shipping setup, and invoice processing. |
| `HOLDING_RATE` | 0.20 (20%) | Annual holding cost as a fraction of unit cost. Covers storage space, insurance, obsolescence risk, and opportunity cost of capital tied up in inventory. Industry standard range: 15–30%. |

---

## EOQ_VALUES

Pre-computed array of Economic Order Quantities, index-matched to BASE_DATA.

**Formula:**
```
EOQ[i] = round( sqrt( 2 * (dailyDemand * 365) * ORDERING_COST / (unitCost * HOLDING_RATE) ) )
```

| Category | Annual Demand | Holding Cost/Unit/Yr | EOQ |
|---|---|---|---|
| Office Supplies | 6,570 | $2.40 | ~828 |
| IT Equipment | 438 | $170 | ~16 |
| Security Gear | 1,022 | $44 | ~48 |
| Medical Supplies | 2,373 | $9 | ~163 |
| Communication Equip | 146 | $240 | ~8 |
| Vehicle Parts | 767 | $76 | ~32 |
| Stationery/Forms | 11,680 | $0.60 | ~1,396 |
| Facility Supplies | 4,015 | $5.60 | ~268 |

(Values rounded to nearest integer as computed in code.)

---

## Scenario Row Fields

Output of `computeScenario()`. Extends BASE_DATA with scenario-adjusted values.

| Field | Type | Description |
|---|---|---|
| `effectiveDemand` | number | `dailyDemand × demandMult` — demand after scenario multiplier |
| `effectiveLeadTime` | number | `leadTimeDays + leadTimeExtra` — lead time after scenario delay |
| `effectiveOrderQty` | number | `orderQty × 0.6` if disruption active, else `orderQty` |
| `daysUntilStockout` | number | `stock / effectiveDemand` — days until inventory reaches zero |
| `statusKey` | string | `'CRITICAL'`, `'WARNING'`, or `'OK'` |
| `eoq` | number | Static EOQ value (does not change with scenario) |

---

## Status Classification

| Status | Condition | Color |
|---|---|---|
| `CRITICAL` | `daysUntilStockout < effectiveLeadTime` | Red |
| `WARNING` | `daysUntilStockout < effectiveLeadTime × 1.5` | Amber |
| `OK` | All other cases | Green |

---

## Scenario Control Parameters

| Control | Variable | Range | Default | Effect |
|---|---|---|---|---|
| Demand Spike slider | `demandMult` | 1.0–3.0 | 1.0 | Multiplies all `dailyDemand` values |
| Lead Time Delay slider | `leadTimeExtra` | 0–14 days | 0 | Adds to all `leadTimeDays` values |
| Supply Disruption toggle | `disruption` | true/false | false | If true, `effectiveOrderQty = orderQty × 0.6` |
