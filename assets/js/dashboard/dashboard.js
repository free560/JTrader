/**
 * dashboard.js — Point d'entrée de dashboard.html.
 * 1) Vérifie l'authentification
 * 2) Monte la sidebar/navbar
 * 3) Charge les trades + paramètres utilisateur depuis Firestore
 * 4) Calcule les statistiques et alimente les cartes KPI, le graphique
 *    et la liste des derniers trades
 */

import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserTrades, getUserDocument } from "../services/firestore.js";
import { computeStats } from "../services/statisticsService.js";
import { renderKpiCards } from "./cards.js";
import { renderEquityCurve } from "./charts.js";
import { formatSignedCurrency, formatDate } from "../utils/formatter.js";
import { DEFAULT_STARTING_CAPITAL, ROUTES } from "../utils/constants.js";
import { showToast } from "../utils/notifications.js";

const RECENT_TRADES_COUNT = 5;

function renderRecentTrades(containerEl, trades) {
  if (trades.length === 0) {
    containerEl.innerHTML = `
      <div class="text-center py-10">
        <div class="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="inbox" class="w-5 h-5 jt-text-muted"></i>
        </div>
        <p class="jt-text-muted text-sm mb-4">Aucun trade enregistré pour le moment.</p>
        <a href="${ROUTES.ADD_TRADE}" class="jt-btn jt-btn-primary inline-flex text-sm">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Ajouter mon premier trade</span>
        </a>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const recent = [...trades].reverse().slice(0, RECENT_TRADES_COUNT);

  const rows = recent.map((trade) => {
    const isWin = trade.result === "WIN";
    return `
      <div class="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center ${isWin ? "bg-[var(--jt-success)]/15" : "bg-[var(--jt-danger)]/15"}">
            <i data-lucide="${trade.direction === "SHORT" ? "trending-down" : "trending-up"}" class="w-4 h-4 ${isWin ? "jt-text-success" : "jt-text-danger"}"></i>
          </div>
          <div>
            <p class="text-sm font-medium">${trade.pair || "—"}</p>
            <p class="text-xs jt-text-muted">${formatDate(trade.createdAt)}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium ${isWin ? "jt-text-success" : "jt-text-danger"}">${formatSignedCurrency(trade.profit)}</p>
          <p class="text-xs jt-text-muted">${trade.result || "—"}</p>
        </div>
      </div>`;
  }).join("");

  containerEl.innerHTML = rows;
  if (window.lucide) window.lucide.createIcons();
}

async function init() {
  const user = await requireAuth();
  mountLayout({ activeKey: "dashboard", pageTitle: "Dashboard", user });
  initLogoutButtons();

  const kpiContainer = document.getElementById("kpi-cards");
  const chartCanvas = document.getElementById("equity-chart");
  const recentTradesContainer = document.getElementById("recent-trades");
  const chartEmptyState = document.getElementById("chart-empty-state");

  try {
    const [trades, userDoc] = await Promise.all([
      getUserTrades(user.uid),
      getUserDocument(user.uid)
    ]);

    const startingCapital = userDoc?.settings?.startingCapital ?? DEFAULT_STARTING_CAPITAL;
    const stats = computeStats(trades, startingCapital);

    renderKpiCards(kpiContainer, stats);
    renderRecentTrades(recentTradesContainer, trades);

    if (trades.length === 0) {
      chartCanvas.classList.add("hidden");
      chartEmptyState.classList.remove("hidden");
    } else {
      chartCanvas.classList.remove("hidden");
      chartEmptyState.classList.add("hidden");
      renderEquityCurve(chartCanvas, trades, startingCapital);
    }
  } catch (error) {
    console.error("[JTrader] Erreur de chargement du dashboard :", error);
    showToast("Impossible de charger les données du dashboard.", "error");
  }
}

init();