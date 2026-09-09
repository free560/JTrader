/**
 * editTrade.js — Logique d'édition d'un trade existant.
 * Séparé de tradeService.js (accès CRUD brut) pour isoler la logique
 * métier propre à l'édition : recalcul du résultat WIN/LOSS et du
 * capitalAfter de CE trade lorsque le profit est modifié.
 *
 * Note : seul capitalAfter de ce trade est recalculé. Les trades
 * suivants ne sont pas réajustés en cascade — ce n'est pas nécessaire
 * puisque le dashboard et les statistiques recalculent toujours
 * l'intégralité de la courbe de capital à partir des profits bruts
 * (voir statisticsService.buildEquityCurve), jamais depuis ces champs
 * stockés qui ne servent qu'à l'affichage informatif sur la fiche du trade.
 */

import { getTrade, updateTrade } from "./tradeService.js";

/** Charge un trade existant pour pré-remplir le formulaire d'édition. */
export async function loadTradeForEdit(uid, tradeId) {
  return getTrade(uid, tradeId);
}

/**
 * Sauvegarde les modifications d'un trade.
 * @param {string} uid
 * @param {string} tradeId
 * @param {object} fields - mêmes champs que createTrade, sans capitalBefore
 */
export async function saveTradeUpdate(uid, tradeId, fields) {
  const profit = fields.profit;
  const capitalAfter = fields.capitalBefore + profit;

  await updateTrade(uid, tradeId, {
    ...fields,
    result: profit >= 0 ? "WIN" : "LOSS",
    capitalAfter
  });
}