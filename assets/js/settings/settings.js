/**
 * ==========================================================================
 * settings.js — Point d'entrée de settings.html
 * ==========================================================================
 * Lit/écrit users/{uid}.settings : darkMode, currency, timezone, monthlyGoal.
 *
 * - Dark Mode : appliqué en direct au clic (aperçu immédiat) via
 *   utils/theme.js, sauvegardé dans Firestore à la soumission du formulaire.
 *   Comme authGuard.requireAuth() réapplique déjà cette préférence sur
 *   CHAQUE page protégée, le thème choisi ici se propage automatiquement
 *   à tout le site dès la prochaine navigation.
 * - Devise : stockée et utilisée par dashboard/trades/statistics/calendar
 *   (qui lisent tous users/{uid}.settings.currency pour leurs formatages).
 * - Fuseau horaire : proposé via la liste standard du navigateur
 *   (Intl.supportedValuesOf), stocké pour référence. Les dates affichées
 *   dans l'app utilisent aujourd'hui le fuseau local de l'appareil ;
 *   le fuseau choisi ici n'est pas encore branché dans les formatages de
 *   date (amélioration possible plus tard si besoin).
 * - Objectif mensuel : stocké, avec une barre de progression calculée à
 *   partir du profit réel du mois en cours (même logique de regroupement
 *   par jour que le calendrier).
 * ==========================================================================
 */

import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserDocument, updateUserProfile, getUserTrades } from "../services/firestore.js";
import { setTheme } from "../utils/theme.js";
import { setButtonLoading } from "../utils/helpers.js";
import { formatCurrency, formatPercent } from "../utils/formatter.js";
import { showToast } from "../utils/notifications.js";
import { DEFAULT_STARTING_CAPITAL } from "../utils/constants.js";

let currentUser = null;
let isDarkMode = true;

const form = document.getElementById("settings-form");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const startingCapitalInput = document.getElementById("starting-capital-input");
const currencySelect = document.getElementById("currency-select");
const timezoneSelect = document.getElementById("timezone-select");
const monthlyGoalInput = document.getElementById("monthly-goal-input");
const progressWrapper = document.getElementById("monthly-goal-progress");
const progressLabel = document.getElementById("monthly-goal-progress-label");
const progressBar = document.getElementById("monthly-goal-progress-bar");
const saveBtn = document.getElementById("settings-save-btn");

/** Remplit le select fuseau horaire avec la liste standard du navigateur. */
function populateTimezones(selected) {
  let zones;
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch (e) {
    // Navigateur plus ancien sans Intl.supportedValuesOf : on garde au
    // minimum le fuseau actuel de l'appareil et celui déjà enregistré.
    zones = [...new Set([Intl.DateTimeFormat().resolvedOptions().timeZone, selected].filter(Boolean))];
  }
  timezoneSelect.innerHTML = zones.map((z) => `<option value="${z}">${z}</option>`).join("");
  if (selected && zones.includes(selected)) {
    timezoneSelect.value = selected;
  }
}

function setDarkModeUI(isDark) {
  isDarkMode = isDark;
  darkModeToggle.setAttribute("aria-checked", String(isDark));
  setTheme(isDark); // aperçu immédiat, sans attendre la sauvegarde
}

/** Calcule le profit du mois en cours et met à jour la barre de progression. */
function updateMonthlyProgress(trades, goal, currency) {
  if (!goal || goal <= 0) {
    progressWrapper.classList.add("hidden");
    return;
  }

  const now = new Date();
  const monthProfit = trades.reduce((sum, trade) => {
    const date = typeof trade.createdAt?.toDate === "function" ? trade.createdAt.toDate() : new Date(trade.createdAt);
    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      return sum + (Number(trade.profit) || 0);
    }
    return sum;
  }, 0);

  const pct = Math.max(0, Math.min(100, (monthProfit / goal) * 100));

  progressWrapper.classList.remove("hidden");
  progressLabel.textContent = `${formatCurrency(monthProfit, currency)} / ${formatCurrency(goal, currency)} (${formatPercent(pct, 0)})`;
  progressBar.style.width = `${pct}%`;
  progressBar.style.backgroundColor = monthProfit >= goal ? "var(--jt-success)" : "var(--jt-accent)";
}

async function handleSubmit(e) {
  e.preventDefault();

  const startingCapital = parseFloat(startingCapitalInput.value);
  if (startingCapitalInput.value !== "" && (isNaN(startingCapital) || startingCapital < 0)) {
    showToast("Le capital de départ doit être un nombre positif.", "error");
    return;
  }

  setButtonLoading(saveBtn, true, "Enregistrement...");

  try {
    await updateUserProfile(currentUser.uid, {
      "settings.darkMode": isDarkMode,
      "settings.startingCapital": startingCapitalInput.value !== "" ? startingCapital : DEFAULT_STARTING_CAPITAL,
      "settings.currency": currencySelect.value,
      "settings.timezone": timezoneSelect.value,
      "settings.monthlyGoal": parseFloat(monthlyGoalInput.value) || 0
    });
    showToast("Paramètres enregistrés avec succès !", "success", 2000);
  } catch (error) {
    console.error("[JTrader] Erreur lors de la sauvegarde des paramètres :", error);
    showToast("Impossible d'enregistrer les paramètres.", "error");
  } finally {
    setButtonLoading(saveBtn, false);
  }
}

async function init() {
  currentUser = await requireAuth();
  mountLayout({ activeKey: "settings", pageTitle: "Paramètres", user: currentUser });
  initLogoutButtons();

  darkModeToggle.addEventListener("click", () => setDarkModeUI(!isDarkMode));
  form.addEventListener("submit", handleSubmit);

  try {
    const [userDoc, trades] = await Promise.all([
      getUserDocument(currentUser.uid),
      getUserTrades(currentUser.uid)
    ]);

    const settings = userDoc?.settings || {};
    setDarkModeUI(settings.darkMode !== false);
    startingCapitalInput.value = settings.startingCapital ?? DEFAULT_STARTING_CAPITAL;
    currencySelect.value = settings.currency || "USD";
    populateTimezones(settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    monthlyGoalInput.value = settings.monthlyGoal || "";

    updateMonthlyProgress(trades, settings.monthlyGoal || 0, settings.currency || "USD");
    monthlyGoalInput.addEventListener("input", () => {
      updateMonthlyProgress(trades, parseFloat(monthlyGoalInput.value) || 0, currencySelect.value);
    });
    currencySelect.addEventListener("change", () => {
      updateMonthlyProgress(trades, parseFloat(monthlyGoalInput.value) || 0, currencySelect.value);
    });
  } catch (error) {
    console.error("[JTrader] Erreur de chargement des paramètres :", error);
    showToast("Impossible de charger les paramètres.", "error");
  }
}

init();