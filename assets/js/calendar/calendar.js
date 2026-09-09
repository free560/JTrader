/**
 * ==========================================================================
 * calendar.js — Point d'entrée de calendar.html
 * ==========================================================================
 * Regroupe les trades par jour calendaire (calculé une seule fois au
 * chargement), puis affiche un mois à la fois : vert si le total du jour
 * est positif, rouge si négatif, neutre si aucun trade. Cliquer sur un
 * jour tradé ouvre le détail des trades de ce jour dans une modale.
 * ==========================================================================
 */

import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserTrades, getUserDocument } from "../services/firestore.js";
import { formatSignedCurrency } from "../utils/formatter.js";
import { showToast } from "../utils/notifications.js";

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

let allTrades = [];
let byDay = new Map();
let currency = "USD";
let currentDate = new Date();
currentDate.setDate(1);

function toDate(value) {
  if (!value) return new Date();
  return typeof value.toDate === "function" ? value.toDate() : new Date(value);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/** Clé locale YYYY-MM-DD (pas d'UTC, pour éviter les décalages de fuseau). */
function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function groupTradesByDay(trades) {
  const map = new Map();
  trades.forEach((trade) => {
    const key = dateKey(toDate(trade.createdAt));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(trade);
  });
  return map;
}

function renderMonthSummary(year, month) {
  let monthProfit = 0;
  let wins = 0;
  let losses = 0;
  let tradedDays = 0;

  byDay.forEach((dayTrades, key) => {
    const [ky, km] = key.split("-").map(Number);
    if (ky === year && km - 1 === month) {
      tradedDays += 1;
      dayTrades.forEach((t) => {
        monthProfit += Number(t.profit) || 0;
        if (t.result === "WIN") wins += 1; else losses += 1;
      });
    }
  });

  const profitEl = document.getElementById("calendar-month-profit");
  profitEl.textContent = formatSignedCurrency(monthProfit, currency);
  profitEl.className = `font-display text-lg font-medium truncate ${monthProfit >= 0 ? "jt-text-success" : "jt-text-danger"}`;

  document.getElementById("calendar-month-days").textContent =
    `${tradedDays} jour${tradedDays > 1 ? "s" : ""} tradé${tradedDays > 1 ? "s" : ""}`;
  document.getElementById("calendar-month-winloss").textContent = `${wins}W / ${losses}L`;
}

function dayCellTemplate(day, key, dayTrades, isToday) {
  const hasTrades = dayTrades.length > 0;
  const dayProfit = dayTrades.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);

  let toneClass = "jt-calendar-cell-neutral";
  if (hasTrades) toneClass = dayProfit >= 0 ? "jt-calendar-cell-win" : "jt-calendar-cell-loss";

  return `
    <button type="button" data-date-key="${key}"
            class="jt-calendar-cell ${toneClass} ${isToday ? "jt-calendar-cell-today" : ""}"
            ${hasTrades ? "" : "disabled"}>
      <span class="jt-calendar-day-number">${day}</span>
      ${hasTrades ? `
        <span class="hidden sm:block jt-calendar-day-amount">${formatSignedCurrency(dayProfit, currency)}</span>
        <span class="sm:hidden w-1.5 h-1.5 rounded-full ${dayProfit >= 0 ? "bg-[var(--jt-success)]" : "bg-[var(--jt-danger)]"}"></span>
      ` : ""}
    </button>`;
}

function renderCalendarGrid(year, month) {
  const grid = document.getElementById("calendar-grid");
  const firstOfMonth = new Date(year, month, 1);
  const jsDay = firstOfMonth.getDay(); // 0 = dimanche
  const leadingBlanks = (jsDay + 6) % 7; // conversion vers semaine commençant lundi
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(new Date());

  let html = "";
  for (let i = 0; i < leadingBlanks; i++) {
    html += `<div class="jt-calendar-cell-empty"></div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(year, month, day));
    html += dayCellTemplate(day, key, byDay.get(key) || [], key === todayKey);
  }

  grid.innerHTML = html;

  grid.querySelectorAll("[data-date-key]:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => openDayModal(btn.dataset.dateKey));
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById("calendar-month-label").textContent = `${MONTH_LABELS[month]} ${year}`;
  renderCalendarGrid(year, month);
  renderMonthSummary(year, month);
}

function tradeRowTemplate(trade) {
  const isWin = trade.result === "WIN";
  const directionIcon = trade.direction === "SHORT" ? "trending-down" : "trending-up";
  return `
    <div class="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center ${isWin ? "bg-[var(--jt-success)]/15" : "bg-[var(--jt-danger)]/15"}">
          <i data-lucide="${directionIcon}" class="w-4 h-4 ${isWin ? "jt-text-success" : "jt-text-danger"}"></i>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">${trade.pair || "—"}</p>
          <p class="text-xs jt-text-muted">${trade.direction || "—"}</p>
        </div>
      </div>
      <p class="text-sm font-medium shrink-0 ${isWin ? "jt-text-success" : "jt-text-danger"}">${formatSignedCurrency(trade.profit, currency)}</p>
    </div>`;
}

function openDayModal(key) {
  const dayTrades = byDay.get(key) || [];
  const [y, m, d] = key.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  document.getElementById("day-modal-title").textContent =
    dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("day-modal-list").innerHTML = dayTrades.map(tradeRowTemplate).join("");

  document.getElementById("day-detail-modal").classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeDayModal() {
  document.getElementById("day-detail-modal").classList.add("hidden");
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function initControls() {
  document.getElementById("calendar-prev").addEventListener("click", () => changeMonth(-1));
  document.getElementById("calendar-next").addEventListener("click", () => changeMonth(1));
  document.getElementById("calendar-today").addEventListener("click", () => {
    currentDate = new Date();
    currentDate.setDate(1);
    renderCalendar();
  });
  document.getElementById("day-modal-close").addEventListener("click", closeDayModal);
  document.getElementById("day-modal-backdrop").addEventListener("click", closeDayModal);
}

async function init() {
  const user = await requireAuth();
  mountLayout({ activeKey: "calendar", pageTitle: "Calendrier", user });
  initLogoutButtons();
  initControls();

  try {
    const [trades, userDoc] = await Promise.all([
      getUserTrades(user.uid),
      getUserDocument(user.uid)
    ]);
    allTrades = trades;
    currency = userDoc?.settings?.currency || "USD";
    byDay = groupTradesByDay(allTrades);
    renderCalendar();
  } catch (error) {
    console.error("[JTrader] Erreur de chargement du calendrier :", error);
    showToast("Impossible de charger le calendrier.", "error");
  }
}

init();