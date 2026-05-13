# Research Notes — EOQ and Inventory Management

## Foundational Literature

### Harris (1913) — "How Many Parts to Make at Once"
Harris, F.W. (1913). How many parts to make at once. *Factory, The Magazine of Management*, 10(2), 135–136.

First publication of the EOQ formula, derived in the context of manufacturing lot sizing. Harris frames the problem as minimizing the sum of setup costs (analogous to ordering costs) and carrying costs (holding costs). His formula `Q = sqrt(2AS/I)` is identical to the modern form with different variable names.

### Wilson (1934) — "A Scientific Routine for Stock Control"
Wilson, R.H. (1934). A scientific routine for stock control. *Harvard Business Review*, 13(1), 116–128.

Wilson popularized the formula for inventory (rather than manufacturing) and gave it practical implementation guidance for stock controllers. The term "Wilson formula" is more commonly used in operations management; the term "Harris-Wilson formula" acknowledges both contributors.

The EOQ implemented in this tool follows Wilson's formulation exactly:
```
Q* = sqrt(2DS/H)
  D = annual demand
  S = ordering cost per order
  H = annual holding cost per unit
```

### Whitin (1953) — Theory of Inventory Management
Whitin, T.M. (1953). *Theory of Inventory Management*. Princeton University Press.

First book-length treatment of inventory theory. Extends Harris-Wilson to allow shortages (backorders), price discounts, and multiple items. Establishes the academic foundation for subsequent inventory research.

---

## Extensions to Basic EOQ

### Silver-Meal Heuristic (Silver & Meal, 1973)
For time-varying (non-stationary) demand, the Silver-Meal heuristic determines order quantities by minimizing average cost per period over a rolling horizon. More appropriate than classic EOQ when demand varies significantly by week or month.

For diplomatic mission supplies, demand does vary (surges during major events, reductions during evacuations), but the baseline approximation of constant demand is adequate for a portfolio simulation.

### EOQ with Safety Stock (Silver, Pyke & Peterson, 1998)
The complete model for stochastic demand:
```
ROP = D_avg × L + z × σ_D × sqrt(L)
```
where z is the service level factor (z=1.65 for 95%) and σ_D is the standard deviation of daily demand.

This model would be the natural next enhancement to the current tool — adding demand variability parameters per category and computing safety stock automatically from a target service level.

### Economic Production Quantity (EPQ)
Modification for in-house production rather than external procurement:
```
Q_p = sqrt(2DS / (H × (1 - d/p)))
```
where d = daily demand, p = daily production rate. Not applicable for a supply procurement tool.

### Quantity Discounts EOQ
When suppliers offer discounts for larger orders, total cost includes a unit price term. The optimal Q may shift to a discount breakpoint. Relevant for the `Communication Equip` and `IT Equipment` categories where large vendors typically offer volume pricing.

---

## Inventory Management in Government and Diplomatic Contexts

### Federal Supply Chain Management
The U.S. General Services Administration (GSA) manages procurement for federal agencies using MRP (Material Requirements Planning) and ERP (Enterprise Resource Planning) systems. Individual agency missions typically operate with local procurement authority for below-threshold items, using spreadsheet-based tracking — the simplest form of EOQ logic without formal system support.

### Humanitarian Logistics
The supply chain structure of diplomatic missions is analogous to humanitarian logistics (NGO field missions, UN peacekeeping operations). Key academic references:

- Balcik & Beamon (2008). Facility location in humanitarian relief. *International Journal of Logistics*. — Models pre-positioning of emergency supplies; relevant to the "stock vs. reorder point" framing in this tool.
- Jahre et al. (2009). Coordination in humanitarian logistics. *International Journal of Physical Distribution & Logistics Management*. — Multi-echelon supply networks; the current tool models a single-echelon (one mission) system.

### Multi-Echelon Extensions
Real diplomatic supply chains typically involve:
1. Central depot (Washington D.C. or regional hub)
2. Regional hub (e.g., Frankfurt for European missions)
3. Country mission (e.g., Embassy New Delhi)

The current tool models only the mission level (level 3). A full model would include lateral resupply between levels and emergency procurement pathways.

---

## Connections to Operations Research

### (s, S) Policy — Optimal for Periodic Review
The classic continuous-review (Q, r) policy — order Q units when stock falls to r — is equivalent to EOQ when demand is deterministic. For stochastic demand, the optimal policy is an (s, S) policy: order up to level S when stock falls to s. This is proved in Scarf (1960), a foundational result in stochastic inventory theory.

### Newsvendor Model
Single-period inventory model (order once before demand is revealed). Not applicable here — the diplomatic mission operates on a continuous replenishment cycle, not single-period.

### Network Flow Formulation
Multi-item, multi-period inventory can be formulated as a minimum-cost network flow problem, solvable in polynomial time. For 8 categories over a 52-week horizon, this would yield the globally optimal replenishment schedule. The current tool approximates this per-category with EOQ.
