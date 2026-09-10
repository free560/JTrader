/**
 * ==========================================================================
 * statistics.js — Point d'entrée de statistics.html
 * ==========================================================================
 * Réutilise intégralement computeStats() (déjà construit en Phase 2 pour
 * le dashboard) et l'affiche sous forme de sections détaillées : Vue
 * d'ensemble, Performance financière, Ratios & Risque.
 * Les graphiques (courbe, histogramme, répartition, par instrument)
 * arrivent en Phase 6 dans ce même dossier statistics/.
 * ==========================================================================
 */

import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserTrades, getUserDocument } from "../services/firestore.js";
import { computeStats } from "../services/statisticsService.js";
import { renderEquityCurve } from "../dashboard/charts.js";
import { renderPnlHistogram, renderMonthlyPerformance, renderWinLossPie, renderInstrumentPerformance } from "./charts.js";
import { formatCurrency, formatSignedCurrency, formatPercent } from "../utils/formatter.js";
import { DEFAULT_STARTING_CAPITAL } from "../utils/constants.js";
import { showToast } from "../utils/notifications.js";

const TONE_CLASSES = {
  success: "jt-text-success",
  danger: "jt-text-danger",
  neutral: "text-[var(--jt-text)]"
};

/** Définition des 3 sections de la page, dans l'ordre d'affichage. */
function getStatSections(stats, currency) {
  return [
    {
      title: "Vue d'ensemble",
      icon: "layout-grid",
      items: [
        { label: "Trades totaux", icon: "list-ordered", value: stats.totalTrades, tone: "neutral" },
        { label: "Trades gagnants", icon: "circle-check", value: stats.winCount, tone: "success" },
        { label: "Trades perdants", icon: "circle-x", value: stats.lossCount, tone: "danger" },
        { label: "Win Rate", icon: "target", value: formatPercent(stats.winRate), tone: stats.winRate >= 50 ? "success" : "danger" }
      ]
    },
    {
      title: "Performance financière",
      icon: "wallet",
      items: [
        { label: "Profit total", icon: "trending-up", value: formatSignedCurrency(stats.totalProfit, currency), tone: stats.totalProfit >= 0 ? "success" : "danger" },
        { label: "Perte totale", icon: "trending-down", value: `-${formatCurrency(stats.grossLoss, currency)}`, tone: "danger" },
        { label: "Profit moyen", icon: "arrow-up-right", value: formatCurrency(stats.avgWin, currency), tone: "success" },
        { label: "Perte moyenne", icon: "arrow-down-right", value: formatCurrency(stats.avgLoss, currency), tone: "danger" },
        { label: "Meilleur trade", icon: "trophy", value: formatSignedCurrency(stats.bestTrade, currency), tone: "success" },
        { label: "Pire trade", icon: "frown", value: formatSignedCurrency(stats.worstTrade, currency), tone: "danger" }
      ]
    },
    {
      title: "Ratios & Risque",
      icon: "gauge",
      items: [
        {
          label: "Facteur de profit",
          icon: "scale",
          value: isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞",
          tone: stats.profitFactor >= 1.5 ? "success" : stats.profitFactor >= 1 ? "neutral" : "danger"
        },
        { label: "Risk/Reward moyen", icon: "split", value: stats.riskRewardAvg > 0 ? `1:${stats.riskRewardAvg.toFixed(2)}` : "—", tone: "neutral" },
        { label: "Espérance / trade", icon: "sigma", value: formatSignedCurrency(stats.expectancy, currency), tone: stats.expectancy >= 0 ? "success" : "danger" },
        { label: "Drawdown Maximum", icon: "trending-down", value: `-${formatPercent(stats.maxDrawdown)}`, tone: "danger" }
      ]
    }
  ];
}

function statCardTemplate(item) {
  return `
    <div class="jt-card p-5 min-w-0">
      <div class="flex items-center justify-between mb-3">
        <span class="jt-label !mb-0">${item.label}</span>
        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <i data-lucide="${item.icon}" class="w-4 h-4 jt-text-muted"></i>
        </div>
      </div>
      <p class="font-display text-lg sm:text-xl font-medium truncate ${TONE_CLASSES[item.tone]}" title="${item.value}">${item.value}</p>
    </div>`;
}

function sectionTemplate(section) {
  return `
    <section class="space-y-3 jt-enter">
      <h2 class="font-display text-base font-medium flex items-center gap-2">
        <i data-lucide="${section.icon}" class="w-4 h-4" style="color:var(--jt-accent)"></i>
        ${section.title}
      </h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${section.items.map(statCardTemplate).join("")}
      </div>
    </section>`;
}

function renderEmptyState(containerEl) {
  containerEl.innerHTML = `
    <div class="jt-card p-10 text-center jt-enter">
      <div class="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
        <i data-lucide="bar-chart-3" class="w-5 h-5 jt-text-muted"></i>
      </div>
      <p class="jt-text-muted text-sm mb-4">Pas encore assez de données pour calculer tes statistiques.</p>
      <a href="add-trade.html" class="jt-btn jt-btn-primary inline-flex text-sm">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>Ajouter mon premier trade</span>
      </a>
    </div>`;
  if (window.lucide) window.lucide.createIcons();
}

function renderStats(containerEl, stats, currency) {
  const sections = getStatSections(stats, currency);
  containerEl.innerHTML = sections.map(sectionTemplate).join("");
  if (window.lucide) window.lucide.createIcons();
}

async function init() {
  const user = await requireAuth();
  mountLayout({ activeKey: "statistics", pageTitle: "Statistiques", user });
  initLogoutButtons();

  const container = document.getElementById("statistics-content");
  const chartsSection = document.getElementById("statistics-charts");

  try {
    const [trades, userDoc] = await Promise.all([
      getUserTrades(user.uid),
      getUserDocument(user.uid)
    ]);

    if (trades.length === 0) {
      renderEmptyState(container);
      chartsSection?.classList.add("hidden");
      return;
    }

    const startingCapital = userDoc?.settings?.startingCapital ?? DEFAULT_STARTING_CAPITAL;
    const currency = userDoc?.settings?.currency || "USD";
    const stats = computeStats(trades, startingCapital);
    renderStats(container, stats, currency);

    chartsSection?.classList.remove("hidden");
    renderEquityCurve(document.getElementById("stats-equity-chart"), trades, startingCapital, currency);
    renderPnlHistogram(document.getElementById("stats-pnl-histogram"), trades, currency);
    renderMonthlyPerformance(document.getElementById("stats-monthly-chart"), trades, currency);
    renderWinLossPie(document.getElementById("stats-winloss-pie"), stats);
    renderInstrumentPerformance(document.getElementById("stats-instrument-chart"), trades, currency);
  } catch (error) {
    console.error("[JTrader] Erreur de chargement des statistiques :", error);
    showToast("Impossible de charger les statistiques.", "error");
  }
}

init();