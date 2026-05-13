/**
 * charts.js — Supply Chain Scenario Planner
 *
 * Chart.js initialization for the "Stock vs. Reorder Point" grouped bar chart.
 *
 * Depends on: Chart.js loaded via CDN (chart.umd.min.js)
 *
 * NOTE: This file is a reference extraction. index.html is self-contained.
 */

const CHART_COLORS = {
  stockOk:   'rgba(232, 160, 32, 0.85)',
  stockWarn: 'rgba(245, 158, 11, 0.85)',
  stockCrit: 'rgba(239, 68, 68, 0.75)',
  reorder:   'rgba(55, 65, 81, 0.70)',
};

/**
 * initStockChart(canvasId, baseData)
 *
 * Creates the initial grouped bar chart with baseline stock and reorder points.
 * Returns the Chart.js instance for later updates via updateChart().
 *
 * @param {string}   canvasId  - ID of the <canvas> element
 * @param {object[]} baseData  - BASE_DATA array
 * @returns {Chart} Chart.js instance
 */
function initStockChart(canvasId, baseData) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: baseData.map(d => d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name),
      datasets: [
        {
          label: 'Current Stock',
          data: baseData.map(d => d.stock),
          backgroundColor: CHART_COLORS.stockOk,
          borderColor: 'transparent',
          borderRadius: 4,
          barPercentage: 0.55,
          categoryPercentage: 0.8,
        },
        {
          label: 'Reorder Point',
          data: baseData.map(d => d.reorderPoint),
          backgroundColor: CHART_COLORS.reorder,
          borderColor: '#6b7280',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.55,
          categoryPercentage: 0.8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a1a',
          borderColor: '#272727',
          borderWidth: 1,
          titleColor: '#e5e5e5',
          bodyColor: '#a3a3a3',
          titleFont: { family: 'IBM Plex Mono', size: 12 },
          bodyFont:  { family: 'IBM Plex Mono', size: 11 },
          padding: 12,
          callbacks: {
            title: items => baseData[items[0].dataIndex].name,
            label: item  => ' ' + item.dataset.label + ': ' + item.raw.toLocaleString() + ' units',
          },
        },
      },
      scales: {
        x: {
          grid:  { color: '#1f1f1f', drawBorder: false },
          ticks: { color: '#6b7280', font: { family: 'IBM Plex Mono', size: 10 } },
        },
        y: {
          grid:  { color: '#1f1f1f', drawBorder: false },
          ticks: { color: '#6b7280', font: { family: 'IBM Plex Mono', size: 10 },
                   callback: v => v.toLocaleString() },
        },
      },
    },
  });
}

/**
 * updateChart(chart, rows)
 *
 * Updates the stock bars with scenario-adjusted stock levels and colors.
 * Reorder point bars remain constant (not affected by scenario parameters).
 *
 * @param {Chart}    chart - Chart.js instance from initStockChart()
 * @param {object[]} rows  - scenario rows from computeScenario()
 */
function updateChart(chart, rows) {
  chart.data.datasets[0].data = rows.map(r => r.stock);
  chart.data.datasets[0].backgroundColor = rows.map(r =>
    r.statusKey === 'CRITICAL' ? CHART_COLORS.stockCrit :
    r.statusKey === 'WARNING'  ? CHART_COLORS.stockWarn :
                                 CHART_COLORS.stockOk
  );
  chart.update('none');
}

// CommonJS export for test harness
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initStockChart, updateChart, CHART_COLORS };
}
