/**
 * charts.js — Construit le graphique principal du dashboard : la courbe
 * d'évolution du capital (equity curve), via Chart.js.
 * Les autres graphiques (histogramme P/L, répartition, par instrument...)
 * seront ajoutés en Phase 6 dans statistics/.
 */

import { buildEquityCurve } from "../services/statisticsService.js";

let equityChartInstance = null;

/**
 * Dessine (ou redessine) la courbe d'équité sur le canvas fourni.
 * @param {HTMLCanvasElement} canvasEl
 * @param {Array<object>} trades
 * @param {number} startingCapital
 */
export function renderEquityCurve(canvasEl, trades, startingCapital) {
  const { labels, values } = buildEquityCurve(trades, startingCapital);

  const isPositive = values[values.length - 1] >= values[0];
  const lineColor = isPositive ? "#22C55E" : "#EF4444";

  const ctx = canvasEl.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasEl.height || 260);
  gradient.addColorStop(0, isPositive ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.25)");
  gradient.addColorStop(1, "rgba(30, 41, 59, 0)");

  if (equityChartInstance) {
    equityChartInstance.destroy();
  }

  equityChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Capital",
          data: values,
          borderColor: lineColor,
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: lineColor
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1E293B",
          borderColor: "rgba(148, 163, 184, 0.2)",
          borderWidth: 1,
          titleColor: "#F8FAFC",
          bodyColor: "#94A3B8",
          padding: 10,
          callbacks: {
            label: (item) => ` ${item.parsed.y.toLocaleString("fr-FR", { style: "currency", currency: "USD" })}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94A3B8", maxTicksLimit: 6, font: { size: 11 } }
        },
        y: {
          grid: { color: "rgba(148, 163, 184, 0.08)" },
          ticks: {
            color: "#94A3B8",
            font: { size: 11 },
            callback: (value) => `$${value.toLocaleString("fr-FR")}`
          }
        }
      }
    }
  });

  return equityChartInstance;
}