/**
 * ==========================================================================
 * addTrade.js — Point d'entrée de add-trade.html
 * ==========================================================================
 * Sert deux modes selon la présence de ?id=... dans l'URL :
 *  - Création (pas de ?id) : formulaire vierge, capitalBefore calculé
 *    automatiquement à partir du solde actuel, redirection → dashboard.
 *  - Édition (?id=xxx, arrivée depuis l'icône crayon de l'historique) :
 *    formulaire pré-rempli via editTrade.loadTradeForEdit(), sauvegarde
 *    via editTrade.saveTradeUpdate(), redirection → historique.
 *
 * Note : l'upload de screenshots (Firebase Storage) a été retiré — Storage
 * exige désormais le plan payant Blaze même pour un usage minime. Les
 * champs screenshotBefore/screenshotAfter restent dans le modèle de
 * données (à null) pour ne pas casser la structure Firestore si l'upload
 * est réactivé plus tard.
 * ==========================================================================
 */

import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserTrades, getUserDocument } from "../services/firestore.js";
import { computeStats } from "../services/statisticsService.js";
import { newTradeRef, createTrade, combineDateAndTimeToTimestamp } from "./tradeService.js";
import { loadTradeForEdit, saveTradeUpdate } from "./editTrade.js";
import { setButtonLoading } from "../utils/helpers.js";
import { formatCurrency } from "../utils/formatter.js";
import { showToast } from "../utils/notifications.js";
import { DEFAULT_STARTING_CAPITAL, ROUTES, SMC_CRITERIA } from "../utils/constants.js";

let currentUser = null;
let startingCapital = DEFAULT_STARTING_CAPITAL;
let runningCapital = DEFAULT_STARTING_CAPITAL;

let isEditMode = false;
let editTradeId = null;
let originalCapitalBefore = 0;

const form = document.getElementById("add-trade-form");
const pairSelect = document.getElementById("pair");
const customPairInput = document.getElementById("custom-pair");
const directionButtons = document.querySelectorAll("[data-direction]");
const directionInput = document.getElementById("direction");
const entryInput = document.getElementById("entry");
const stopLossInput = document.getElementById("stopLoss");
const takeProfitInput = document.getElementById("takeProfit");
const lotSizeInput = document.getElementById("lotSize");
const profitInput = document.getElementById("profit");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const notesInput = document.getElementById("notes");
const capitalPreviewEl = document.getElementById("capital-preview");
const submitBtn = document.getElementById("add-trade-submit");
const cancelLink = document.getElementById("add-trade-cancel-link");

/** Initialise la grille de checkboxes SMC à partir de la constante partagée. */
function renderSmcCheckboxes() {
  const container = document.getElementById("smc-grid");
  container.innerHTML = SMC_CRITERIA.map((c) => `
    <label class="flex items-center gap-2.5 jt-card !bg-white/[0.03] px-3.5 py-3 rounded-xl cursor-pointer hover:!bg-white/[0.06] transition-colors">
      <input type="checkbox" name="smc-${c.key}" data-smc-key="${c.key}" class="w-4 h-4 accent-[var(--jt-accent)]" />
      <span class="text-sm">
        <span class="font-medium">${c.label}</span>
        <span class="jt-text-muted block text-xs">${c.fullLabel}</span>
      </span>
    </label>`).join("");
}

/** Bascule visuellement le bouton Direction actif (LONG/SHORT). */
function initDirectionToggle() {
  directionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      directionButtons.forEach((b) => b.classList.remove("jt-direction-active"));
      btn.classList.add("jt-direction-active");
      directionInput.value = btn.dataset.direction;
    });
  });
}

/** Affiche/masque le champ instrument personnalisé selon la sélection. */
function initPairSelect() {
  pairSelect.addEventListener("change", () => {
    const isCustom = pairSelect.value === "__custom__";
    customPairInput.classList.toggle("hidden", !isCustom);
    if (isCustom) customPairInput.focus();
  });
}

/** Recalcule et affiche en direct le capital projeté après ce trade. */
function updateCapitalPreview() {
  const profit = parseFloat(profitInput.value) || 0;
  const base = isEditMode ? originalCapitalBefore : runningCapital;
  const projected = base + profit;
  capitalPreviewEl.textContent =
    `${formatCurrency(base)} → ${formatCurrency(projected)}`;
  capitalPreviewEl.className = profit >= 0
    ? "font-display text-sm jt-text-success"
    : "font-display text-sm jt-text-danger";
}

function getSelectedPair() {
  return pairSelect.value === "__custom__" ? customPairInput.value.trim() : pairSelect.value;
}

function getSmcSelections() {
  const selections = {};
  document.querySelectorAll("[data-smc-key]").forEach((checkbox) => {
    selections[checkbox.dataset.smcKey] = checkbox.checked;
  });
  return selections;
}

function validateForm() {
  const errors = [];

  if (!getSelectedPair()) errors.push("Sélectionne ou saisis un instrument.");
  if (!directionInput.value) errors.push("Choisis une direction (LONG ou SHORT).");
  if (!entryInput.value) errors.push("Le prix d'entrée est requis.");
  if (!profitInput.value) errors.push("Indique le profit ou la perte du trade.");
  if (!dateInput.value) errors.push("La date du trade est requise.");

  if (errors.length > 0) {
    showToast(errors[0], "error");
    return false;
  }
  return true;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Pré-remplit le formulaire avec les données d'un trade existant. */
function populateFormForEdit(trade) {
  // Instrument : sélectionne l'option si elle existe, sinon bascule en saisie libre.
  pairSelect.value = trade.pair || "";
  if (pairSelect.value !== trade.pair) {
    pairSelect.value = "__custom__";
    customPairInput.classList.remove("hidden");
    customPairInput.value = trade.pair || "";
  }

  // Direction
  directionInput.value = trade.direction || "";
  directionButtons.forEach((b) => {
    b.classList.toggle("jt-direction-active", b.dataset.direction === trade.direction);
  });

  entryInput.value = trade.entry ?? "";
  stopLossInput.value = trade.stopLoss ?? "";
  takeProfitInput.value = trade.takeProfit ?? "";
  lotSizeInput.value = trade.lotSize ?? "";
  profitInput.value = trade.profit ?? "";
  notesInput.value = trade.notes || "";

  const created = typeof trade.createdAt?.toDate === "function"
    ? trade.createdAt.toDate()
    : new Date(trade.createdAt || Date.now());
  dateInput.value = toDateInputValue(created);
  timeInput.value = toTimeInputValue(created);

  // Critères SMC
  document.querySelectorAll("[data-smc-key]").forEach((checkbox) => {
    checkbox.checked = Boolean(trade[checkbox.dataset.smcKey]);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  setButtonLoading(submitBtn, true, "Enregistrement...");

  try {
    const profit = parseFloat(profitInput.value);
    const smc = getSmcSelections();

    const commonFields = {
      pair: getSelectedPair(),
      direction: directionInput.value,
      entry: parseFloat(entryInput.value),
      stopLoss: stopLossInput.value ? parseFloat(stopLossInput.value) : null,
      takeProfit: takeProfitInput.value ? parseFloat(takeProfitInput.value) : null,
      lotSize: lotSizeInput.value ? parseFloat(lotSizeInput.value) : null,
      profit,
      strategy: "SMC",
      bos: smc.bos || false,
      choch: smc.choch || false,
      fvg: smc.fvg || false,
      orderBlock: smc.orderBlock || false,
      liquidityGrab: smc.liquidityGrab || false,
      notes: notesInput.value.trim(),
      createdAt: combineDateAndTimeToTimestamp(dateInput.value, timeInput.value)
    };

    if (isEditMode) {
      await saveTradeUpdate(currentUser.uid, editTradeId, {
        ...commonFields,
        capitalBefore: originalCapitalBefore
      });
      showToast("Trade mis à jour avec succès !", "success", 1500);
      window.location.href = ROUTES.TRADES;
    } else {
      const capitalBefore = runningCapital;
      const capitalAfter = capitalBefore + profit;
      const tradeRef = newTradeRef(currentUser.uid);

      await createTrade(tradeRef, {
        ...commonFields,
        capitalBefore,
        capitalAfter,
        result: profit >= 0 ? "WIN" : "LOSS",
        screenshotBefore: null,
        screenshotAfter: null
      });

      showToast("Trade enregistré avec succès !", "success", 1500);
      window.location.href = ROUTES.DASHBOARD;
    }
  } catch (error) {
    console.error("[JTrader] Erreur lors de l'enregistrement du trade :", error);
    showToast("Impossible d'enregistrer ce trade. Réessaie.", "error");
    setButtonLoading(submitBtn, false);
  }
}

function setDefaultDateTime() {
  const now = new Date();
  dateInput.value = toDateInputValue(now);
  timeInput.value = toTimeInputValue(now);
}

async function init() {
  currentUser = await requireAuth();

  const params = new URLSearchParams(window.location.search);
  editTradeId = params.get("id");
  isEditMode = Boolean(editTradeId);

  mountLayout({
    activeKey: "trades",
    pageTitle: isEditMode ? "Modifier le trade" : "Ajouter un trade",
    user: currentUser
  });
  initLogoutButtons();

  renderSmcCheckboxes();
  initDirectionToggle();
  initPairSelect();

  if (isEditMode) {
    submitBtn.querySelector("span").textContent = "Enregistrer les modifications";
    cancelLink.href = ROUTES.TRADES;
  } else {
    setDefaultDateTime();
  }

  try {
    const [trades, userDoc] = await Promise.all([
      getUserTrades(currentUser.uid),
      getUserDocument(currentUser.uid)
    ]);
    startingCapital = userDoc?.settings?.startingCapital ?? DEFAULT_STARTING_CAPITAL;
    const stats = computeStats(trades, startingCapital);
    runningCapital = stats.currentBalance;
  } catch (error) {
    console.warn("[JTrader] Impossible de charger le capital actuel, valeur par défaut utilisée.", error);
    runningCapital = startingCapital;
  }

  if (isEditMode) {
    try {
      const trade = await loadTradeForEdit(currentUser.uid, editTradeId);
      if (!trade) {
        showToast("Ce trade est introuvable.", "error");
        window.location.href = ROUTES.TRADES;
        return;
      }
      originalCapitalBefore = trade.capitalBefore ?? startingCapital;
      populateFormForEdit(trade);
    } catch (error) {
      console.error("[JTrader] Erreur lors du chargement du trade à modifier :", error);
      showToast("Impossible de charger ce trade.", "error");
      window.location.href = ROUTES.TRADES;
      return;
    }
  }

  updateCapitalPreview();
  profitInput.addEventListener("input", updateCapitalPreview);
  form.addEventListener("submit", handleSubmit);
}

init();