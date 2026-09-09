/**
 * formatter.js — Fonctions de mise en forme de l'affichage (devise,
 * pourcentages, dates). Séparé de helpers.js pour garder ce dernier
 * focalisé sur la logique de formulaire.
 */

export function formatCurrency(value, currency = "USD") {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatPercent(value, decimals = 1) {
  const num = Number(value);
  if (!isFinite(num)) return "∞";
  return `${num.toFixed(decimals)}%`;
}

export function formatSignedCurrency(value, currency = "USD") {
  const num = Number(value) || 0;
  const formatted = formatCurrency(Math.abs(num), currency);
  return num >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatDate(value) {
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}