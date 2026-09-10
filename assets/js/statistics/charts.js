/**
 * ==========================================================================
 * charts.js (statistics) — Graphiques de la Phase 6, via Chart.js
 * ==========================================================================
 * La courbe d'équité est réutilisée telle quelle depuis dashboard/charts.js
 * (aucune raison de dupliquer cette logique). Ce fichier ajoute les 4 autres
 * visualisations demandées : histogramme Profit/Perte, gains mensuels,
 * répartition WIN/LOSS, performance par instrument.
 * ==========================================================================
 */

const SUCCESS = "#22C55E";
const DANGER = "#EF4444";
const MUTED = "#94A3B8";

const instances = {
  histogram: null,
  monthly: null,
  winLoss: null,
  instrument: null
};

const baseTooltip = {
  backgroundColor: "#1E293B",
  borderColor: "rgba(148, 163, 184, 0.2)",
  borderWidth: 1,
  titleColor: "#F8FAFC",
  bodyColor: "#94A3B8",
  padding: 10
};

function currencyLabel(value, currency = "USD") {
  return value.toLocaleString("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 });
}

function toDate(value) {
  if (!value) return new Date();
  return typeof value.toDate === "function" ? value.toDate() : new Date(value);
}

/** Histogramme Profit/Perte — une barre par trade, colorée selon le signe. */
export function renderPnlHistogram(canvasEl, trades, currency = "USD") {
  const labels = trades.map((_, i) => `#${i + 1}`);
  const values = trades.map((t) => Number(t.profit) || 0);
  const colors = values.map((v) => (v >= 0 ? SUCCESS : DANGER));

  if (instances.histogram) instances.histogram.destroy();

  instances.histogram = new Chart(canvasEl.getContext("2d"), {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 3, maxBarThickness: 18 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...baseTooltip, callbacks: { label: (item) => ` ${currencyLabel(item.parsed.y, currency)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: MUTED, maxTicksLimit: 8, font: { size: 10 } } },
        y: { grid: { color: "rgba(148, 163, 184, 0.08)" }, ticks: { color: MUTED, font: { size: 10 }, callback: (v) => `$${v}` } }
      }
    }
  });
}

/** Gains mensuels — somme des profits regroupée par mois calendaire. */
export function renderMonthlyPerformance(canvasEl, trades, currency = "USD") {
  const byMonth = new Map();

  trades.forEach((trade) => {
    const date = toDate(trade.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) || 0) + (Number(trade.profit) || 0));
  });

  const sortedKeys = [...byMonth.keys()].sort();
  const labels = sortedKeys.map((key) => {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  });
  const values = sortedKeys.map((key) => Number(byMonth.get(key).toFixed(2)));
  const colors = values.map((v) => (v >= 0 ? SUCCESS : DANGER));

  if (instances.monthly) instances.monthly.destroy();

  instances.monthly = new Chart(canvasEl.getContext("2d"), {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, maxBarThickness: 32 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...baseTooltip, callbacks: { label: (item) => ` ${currencyLabel(item.parsed.y, currency)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: MUTED, font: { size: 11 } } },
        y: { grid: { color: "rgba(148, 163, 184, 0.08)" }, ticks: { color: MUTED, font: { size: 10 }, callback: (v) => `$${v}` } }
      }
    }
  });
}

/** Répartition WIN / LOSS — doughnut chart. */
export function renderWinLossPie(canvasEl, stats) {
  if (instances.winLoss) instances.winLoss.destroy();

  instances.winLoss = new Chart(canvasEl.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["WIN", "LOSS"],
      datasets: [{
        data: [stats.winCount, stats.lossCount],
        backgroundColor: [SUCCESS, DANGER],
        borderColor: "#1E293B",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: { position: "bottom", labels: { color: MUTED, font: { size: 12 }, padding: 16, usePointStyle: true, pointStyle: "circle" } },
        tooltip: baseTooltip
      }
    }
  });
}

/** Performance par instrument — profit net cumulé, un instrument par barre. */
export function renderInstrumentPerformance(canvasEl, trades, currency = "USD") {
  const byPair = new Map();

  trades.forEach((trade) => {
    const pair = trade.pair || "Inconnu";
    byPair.set(pair, (byPair.get(pair) || 0) + (Number(trade.profit) || 0));
  });

  const sorted = [...byPair.entries()].sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([pair]) => pair);
  const values = sorted.map(([, total]) => Number(total.toFixed(2)));
  const colors = values.map((v) => (v >= 0 ? SUCCESS : DANGER));

  if (instances.instrument) instances.instrument.destroy();

  instances.instrument = new Chart(canvasEl.getContext("2d"), {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, maxBarThickness: 22 }] },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...baseTooltip, callbacks: { label: (item) => ` ${currencyLabel(item.parsed.x, currency)}` } }
      },
      scales: {
        x: { grid: { color: "rgba(148, 163, 184, 0.08)" }, ticks: { color: MUTED, font: { size: 10 }, callback: (v) => `$${v}` } },
        y: { grid: { display: false }, ticks: { color: MUTED, font: { size: 11 } } }
      }
    }
  });
}