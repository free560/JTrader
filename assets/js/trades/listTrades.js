/**
 * ==========================================================================
 * listTrades.js — Point d'entrée de trades.html
 * ==========================================================================
 * 1) Charge tous les trades de l'utilisateur
 * 2) Applique recherche + filtres (direction, résultat) + tri
 * 3) Pagine le résultat et rend le tableau
 * 4) Câble les actions Modifier / Supprimer sur chaque ligne
 * ==========================================================================
 */

import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserTrades, getUserDocument } from "../services/firestore.js";
import { confirmAndDeleteTrade } from "./deleteTrade.js";
import { exportTradesToPDF, exportTradesToExcel } from "./exportTrades.js";
import { formatSignedCurrency, formatDate } from "../utils/formatter.js";
import { ROUTES } from "../utils/constants.js";
import { showToast } from "../utils/notifications.js";

const PAGE_SIZE = 10;

let currentUser = null;
let allTrades = [];
let currency = "USD";

const state = {
  search: "",
  direction: "all",
  result: "all",
  sortKey: "createdAt",
  sortDir: "desc",
  page: 1
};

const searchInput = document.getElementById("search-input");
const directionFilter = document.getElementById("filter-direction");
const resultFilter = document.getElementById("filter-result");
const tableBody = document.getElementById("trades-table-body");
const tableWrapper = document.getElementById("trades-table-wrapper");
const emptyState = document.getElementById("trades-empty-state");
const noResultsState = document.getElementById("trades-no-results");
const paginationEl = document.getElementById("trades-pagination");
const resultCountEl = document.getElementById("trades-result-count");
const exportMenuBtn = document.getElementById("export-menu-btn");
const exportMenu = document.getElementById("export-menu");

const SORTABLE_COLUMNS = [
  { key: "createdAt", label: "Date" },
  { key: "pair", label: "Instrument" },
  { key: "direction", label: "Direction" },
  { key: "profit", label: "Profit" },
  { key: "result", label: "Résultat" }
];

function toDate(value) {
  if (!value) return new Date(0);
  return typeof value.toDate === "function" ? value.toDate() : new Date(value);
}

/** Applique recherche, filtres et tri sur allTrades, sans muter la source. */
function getProcessedTrades() {
  let result = [...allTrades];

  if (state.search.trim()) {
    const term = state.search.trim().toLowerCase();
    result = result.filter((t) =>
      (t.pair || "").toLowerCase().includes(term) ||
      (t.notes || "").toLowerCase().includes(term)
    );
  }

  if (state.direction !== "all") {
    result = result.filter((t) => t.direction === state.direction);
  }

  if (state.result !== "all") {
    result = result.filter((t) => t.result === state.result);
  }

  result.sort((a, b) => {
    let valA = a[state.sortKey];
    let valB = b[state.sortKey];

    if (state.sortKey === "createdAt") {
      valA = toDate(valA).getTime();
      valB = toDate(valB).getTime();
    } else if (state.sortKey === "profit") {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else {
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
    }

    if (valA < valB) return state.sortDir === "asc" ? -1 : 1;
    if (valA > valB) return state.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return result;
}

function renderSortIndicators() {
  document.querySelectorAll("[data-sort-key]").forEach((th) => {
    const icon = th.querySelector("[data-sort-icon]");
    if (!icon) return;
    if (th.dataset.sortKey === state.sortKey) {
      icon.setAttribute("data-lucide", state.sortDir === "asc" ? "arrow-up" : "arrow-down");
      icon.classList.remove("opacity-0");
    } else {
      icon.classList.add("opacity-0");
    }
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderRow(trade) {
  const isWin = trade.result === "WIN";
  return `
    <tr class="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <td class="py-3 px-4 text-sm jt-text-muted whitespace-nowrap">${formatDate(trade.createdAt)}</td>
      <td class="py-3 px-4 text-sm font-medium whitespace-nowrap">${trade.pair || "—"}</td>
      <td class="py-3 px-4 text-sm whitespace-nowrap">
        <span class="inline-flex items-center gap-1.5 ${trade.direction === "SHORT" ? "jt-text-danger" : "jt-text-success"}">
          <i data-lucide="${trade.direction === "SHORT" ? "trending-down" : "trending-up"}" class="w-3.5 h-3.5"></i>
          ${trade.direction || "—"}
        </span>
      </td>
      <td class="py-3 px-4 text-sm font-medium whitespace-nowrap ${isWin ? "jt-text-success" : "jt-text-danger"}">
        ${formatSignedCurrency(trade.profit, currency)}
      </td>
      <td class="py-3 px-4 whitespace-nowrap">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${isWin ? "bg-[var(--jt-success)]/15 jt-text-success" : "bg-[var(--jt-danger)]/15 jt-text-danger"}">
          ${trade.result || "—"}
        </span>
      </td>
      <td class="py-3 px-4 whitespace-nowrap">
        <div class="flex items-center gap-1">
          <a href="${ROUTES.ADD_TRADE}?id=${trade.id}" class="p-1.5 rounded-lg jt-text-muted hover:text-white hover:bg-white/5 transition-colors" aria-label="Modifier">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </a>
          <button data-action="delete-trade" data-trade-id="${trade.id}" data-trade-pair="${trade.pair || "ce trade"}"
                  class="p-1.5 rounded-lg jt-text-muted hover:jt-text-danger hover:bg-[var(--jt-danger)]/10 transition-colors" aria-label="Supprimer">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>`;
}

function renderPagination(totalItems, totalPages) {
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  paginationEl.innerHTML = `
    <button data-page-action="prev" class="jt-btn jt-btn-ghost !px-3 !py-2 text-sm" ${state.page === 1 ? "disabled" : ""}>
      <i data-lucide="chevron-left" class="w-4 h-4"></i>
    </button>
    <span class="text-sm jt-text-muted px-2">Page ${state.page} / ${totalPages}</span>
    <button data-page-action="next" class="jt-btn jt-btn-ghost !px-3 !py-2 text-sm" ${state.page === totalPages ? "disabled" : ""}>
      <i data-lucide="chevron-right" class="w-4 h-4"></i>
    </button>`;

  if (window.lucide) window.lucide.createIcons();

  paginationEl.querySelector('[data-page-action="prev"]')?.addEventListener("click", () => {
    if (state.page > 1) { state.page -= 1; render(); }
  });
  paginationEl.querySelector('[data-page-action="next"]')?.addEventListener("click", () => {
    if (state.page < totalPages) { state.page += 1; render(); }
  });
}

function attachRowActions() {
  tableBody.querySelectorAll('[data-action="delete-trade"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tradeId = btn.dataset.tradeId;
      const pairLabel = btn.dataset.tradePair;
      const deleted = await confirmAndDeleteTrade(currentUser.uid, tradeId, pairLabel);
      if (deleted) {
        allTrades = allTrades.filter((t) => t.id !== tradeId);
        render();
      }
    });
  });
}

function render() {
  const processed = getProcessedTrades();
  const totalItems = processed.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = processed.slice(start, start + PAGE_SIZE);

  if (allTrades.length === 0) {
    tableWrapper.classList.add("hidden");
    emptyState.classList.remove("hidden");
    noResultsState.classList.add("hidden");
    paginationEl.innerHTML = "";
    resultCountEl.textContent = "";
    return;
  }

  emptyState.classList.add("hidden");

  if (totalItems === 0) {
    tableWrapper.classList.add("hidden");
    noResultsState.classList.remove("hidden");
    paginationEl.innerHTML = "";
    resultCountEl.textContent = "";
    return;
  }

  noResultsState.classList.add("hidden");
  tableWrapper.classList.remove("hidden");

  tableBody.innerHTML = pageItems.map(renderRow).join("");
  resultCountEl.textContent = `${totalItems} trade${totalItems > 1 ? "s" : ""}`;

  if (window.lucide) window.lucide.createIcons();
  renderSortIndicators();
  renderPagination(totalItems, totalPages);
  attachRowActions();
}

function initSortableHeaders() {
  document.querySelectorAll("[data-sort-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sortKey;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "desc";
      }
      state.page = 1;
      render();
    });
  });
}

function initFilters() {
  let searchDebounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.search = searchInput.value;
      state.page = 1;
      render();
    }, 200);
  });

  directionFilter.addEventListener("change", () => {
    state.direction = directionFilter.value;
    state.page = 1;
    render();
  });

  resultFilter.addEventListener("change", () => {
    state.result = resultFilter.value;
    state.page = 1;
    render();
  });
}

function closeExportMenu() {
  exportMenu.classList.add("hidden");
}

function initExportMenu() {
  exportMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!exportMenu.contains(e.target) && e.target !== exportMenuBtn) {
      closeExportMenu();
    }
  });

  exportMenu.querySelector('[data-export="pdf"]').addEventListener("click", () => {
    closeExportMenu();
    const trades = getProcessedTrades();
    if (trades.length === 0) {
      showToast("Aucun trade à exporter avec ces filtres.", "error");
      return;
    }
    try {
      exportTradesToPDF(trades, currency);
      showToast("Export PDF généré.", "success", 2000);
    } catch (error) {
      console.error("[JTrader] Erreur export PDF :", error);
      showToast("Impossible de générer le PDF.", "error");
    }
  });

  exportMenu.querySelector('[data-export="excel"]').addEventListener("click", () => {
    closeExportMenu();
    const trades = getProcessedTrades();
    if (trades.length === 0) {
      showToast("Aucun trade à exporter avec ces filtres.", "error");
      return;
    }
    try {
      exportTradesToExcel(trades, currency);
      showToast("Export Excel généré.", "success", 2000);
    } catch (error) {
      console.error("[JTrader] Erreur export Excel :", error);
      showToast("Impossible de générer le fichier Excel.", "error");
    }
  });
}

async function init() {
  currentUser = await requireAuth();
  mountLayout({ activeKey: "trades", pageTitle: "Historique des trades", user: currentUser });
  initLogoutButtons();
  initSortableHeaders();
  initFilters();
  initExportMenu();

  try {
    const [trades, userDoc] = await Promise.all([
      getUserTrades(currentUser.uid),
      getUserDocument(currentUser.uid)
    ]);
    allTrades = trades;
    currency = userDoc?.settings?.currency || "USD";
    render();
  } catch (error) {
    console.error("[JTrader] Erreur de chargement des trades :", error);
    showToast("Impossible de charger l'historique des trades.", "error");
  }
}

init();