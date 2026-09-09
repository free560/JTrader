/**
 * cards.js — Génère les cartes KPI du dashboard à partir des statistiques
 * calculées par statisticsService.computeStats().
 */

import { formatCurrency, formatSignedCurrency, formatPercent } from "../utils/formatter.js";

const KPI_DEFS = [
  {
    key: "currentBalance",
    label: "Solde actuel",
    icon: "wallet",
    format: (s) => formatCurrency(s.currentBalance),
    tone: () => "neutral"
  },
  {
    key: "totalProfit",
    label: "Profit total",
    icon: "trending-up",
    format: (s) => formatSignedCurrency(s.totalProfit),
    tone: (s) => (s.totalProfit >= 0 ? "success" : "danger")
  },
  {
    key: "totalTrades",
    label: "Trades totaux",
    icon: "list-ordered",
    format: (s) => String(s.totalTrades),
    tone: () => "neutral"
  },
  {
    key: "winRate",
    label: "Win Rate",
    icon: "target",
    format: (s) => formatPercent(s.winRate),
    tone: (s) => (s.winRate >= 50 ? "success" : "danger")
  },
  {
    key: "maxDrawdown",
    label: "Drawdown Maximum",
    icon: "trending-down",
    format: (s) => `-${formatPercent(s.maxDrawdown)}`,
    tone: () => "danger"
  }
];

const TONE_CLASSES = {
  success: "jt-text-success",
  danger: "jt-text-danger",
  neutral: "text-[var(--jt-text)]"
};

function cardTemplate(def, stats) {
  const toneClass = TONE_CLASSES[def.tone(stats)];
  const value = def.format(stats);
  return `
    <div class="jt-card p-5 jt-enter min-w-0">
      <div class="flex items-center justify-between mb-3">
        <span class="jt-label !mb-0">${def.label}</span>
        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <i data-lucide="${def.icon}" class="w-4 h-4 jt-text-muted"></i>
        </div>
      </div>
      <p class="font-display text-lg sm:text-2xl font-medium ${toneClass} truncate" title="${value}">${value}</p>
    </div>`;
}

/**
 * Rend les cartes KPI dans le conteneur donné.
 * @param {HTMLElement} containerEl
 * @param {object} stats - résultat de computeStats()
 */
export function renderKpiCards(containerEl, stats) {
  containerEl.innerHTML = KPI_DEFS.map((def) => cardTemplate(def, stats)).join("");
  if (window.lucide) window.lucide.createIcons();
}