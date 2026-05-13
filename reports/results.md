# Simulation Results — Supply Chain Scenario Planner

## Baseline State (No Scenario Adjustments)

At baseline (demandMult=1.0, leadTimeExtra=0, disruption=off):

| Category | Stock | ROP | Days Until Stockout | Status |
|---|---|---|---|---|
| Office Supplies | 450 | 120 | 25.0 days | OK |
| IT Equipment | 28 | 10 | 23.3 days | OK |
| Security Gear | 95 | 30 | 33.9 days | OK |
| Medical Supplies | 210 | 75 | 32.3 days | OK |
| Communication Equip | 15 | 8 | 37.5 days | OK |
| Vehicle Parts | 72 | 25 | 34.3 days | OK |
| Stationery/Forms | 890 | 200 | 27.8 days | OK |
| Facility Supplies | 340 | 100 | 30.9 days | OK |

**Baseline KPIs:**
- Categories below reorder point: 0
- Total inventory value: ~$88,400 (at base stock levels)
- Average base lead time: 13.9 days

All 8 categories are in OK status at baseline. The stock levels are set to represent a well-managed mission mid-cycle — recently restocked but not excessively so.

---

## Scenario: 2x Demand Spike

With demandMult=2.0 (double daily consumption):

| Category | Eff. Demand | Days Until Stockout | Eff. Lead Time | Status |
|---|---|---|---|---|
| Office Supplies | 36/day | 12.5 days | 7 days | OK |
| IT Equipment | 2.4/day | 11.7 days | 21 days | **CRITICAL** |
| Security Gear | 5.6/day | 17.0 days | 14 days | OK |
| Medical Supplies | 13/day | 16.2 days | 10 days | OK |
| Communication Equip | 0.8/day | 18.8 days | 28 days | **CRITICAL** |
| Vehicle Parts | 4.2/day | 17.1 days | 18 days | WARNING |
| Stationery/Forms | 64/day | 13.9 days | 5 days | OK |
| Facility Supplies | 22/day | 15.5 days | 8 days | OK |

**Key finding:** Long-lead-time categories (IT Equipment at 21 days, Communication Equip at 28 days) immediately go CRITICAL under a 2× demand spike because their lead times exceed the halved days-of-supply. This highlights the structural vulnerability of high-cost, long-lead-time items in operational surge scenarios.

---

## Scenario: +7 Day Lead Time Delay

With leadTimeExtra=7 (all lead times extended by 1 week):

| Category | Days Until Stockout | Eff. Lead Time | Status |
|---|---|---|---|
| Office Supplies | 25.0 | 14 days | OK |
| IT Equipment | 23.3 | 28 days | WARNING |
| Security Gear | 33.9 | 21 days | OK |
| Medical Supplies | 32.3 | 17 days | OK |
| Communication Equip | 37.5 | 35 days | OK (barely) |
| Vehicle Parts | 34.3 | 25 days | OK |
| Stationery/Forms | 27.8 | 12 days | OK |
| Facility Supplies | 30.9 | 15 days | OK |

Lead time delays push IT Equipment into WARNING status. Communication Equipment approaches its threshold (37.5 days of supply vs. 35 days effective lead time — marginal OK that would flip to WARNING with any additional delay).

---

## Scenario: Combined Worst Case (2x Demand + 7 Day Delay + Disruption)

With demandMult=2.0, leadTimeExtra=7, disruption=on:

CRITICAL categories: IT Equipment, Communication Equip, Security Gear, Vehicle Parts
WARNING categories: Medical Supplies
OK categories: Office Supplies, Stationery/Forms, Facility Supplies

High-frequency, low-cost, short-lead-time items (Office Supplies, Stationery, Facility) are most resilient — their high stock levels and short lead times provide buffer even under surge conditions. High-cost, low-frequency, long-lead-time items (IT, Communication) are most vulnerable — their lean stock levels are adequate at baseline but brittle under disruption.

---

## EOQ Analysis

| Category | EOQ | Current Order Qty | EOQ vs. Order Qty |
|---|---|---|---|
| Office Supplies | ~828 | 300 | EOQ >> orderQty (ordering too small, too often) |
| IT Equipment | ~16 | 20 | Close to optimal |
| Security Gear | ~48 | 60 | Slightly above EOQ |
| Medical Supplies | ~163 | 150 | Close to optimal |
| Communication Equip | ~8 | 12 | Above EOQ (holding excess) |
| Vehicle Parts | ~32 | 50 | Above EOQ |
| Stationery/Forms | ~1,396 | 600 | EOQ >> orderQty (significant holding cost savings available) |
| Facility Supplies | ~268 | 250 | Close to optimal |

**Key finding:** Office Supplies and Stationery/Forms have EOQ values 2.5–3× their standard order quantities. At the $50 ordering cost and $0.60/unit/year holding cost, the math strongly favors larger, less frequent orders. This is a common pattern for low-cost, high-volume consumables.

---

## Structural Observations

1. **Communication Equipment is the highest-risk category** at baseline: the lowest stock level (15 units), highest unit cost ($1,200), and longest lead time (28 days). Under any demand increase or delay, it hits CRITICAL first.

2. **Stationery/Forms is the most resilient**: 890 units of stock, $3 unit cost, 5-day lead time. Even at 3× demand (96 units/day), stock lasts ~9 days — longer than the lead time.

3. **The disruption scenario (40% order qty reduction) primarily affects long-run supply security**, not immediate stockout risk. Its effect is visible in `effectiveOrderQty` but doesn't directly change `daysUntilStockout` (which depends on current stock, not future order sizes).
