/**
 * statisticsService.js — Calcule les indicateurs de performance à partir
 * d'une liste de trades. Utilisé par le dashboard (Phase 2) et sera repris
 * intégralement par la page Statistiques (Phase 5).
 *
 * Un trade attendu a au minimum la forme :
 * { profit: number, result: 'WIN'|'LOSS', createdAt: Timestamp|Date, ... }
 */

import { DEFAULT_STARTING_CAPITAL } from "../utils/constants.js";

/**
 * Convertit un Timestamp Firestore ou une Date en objet Date JS.
 */
function toDate(value) {
  if (!value) return new Date();
  return typeof value.toDate === "function" ? value.toDate() : new Date(value);
}

/**
 * Construit la courbe d'équité cumulative à partir des trades (triés
 * du plus ancien au plus récent).
 * @returns {{ labels: string[], values: number[] }}
 */
export function buildEquityCurve(trades, startingCapital = DEFAULT_STARTING_CAPITAL) {
  let running = startingCapital;
  const labels = ["Départ"];
  const values = [startingCapital];

  trades.forEach((trade, index) => {
    running += Number(trade.profit) || 0;
    const date = toDate(trade.createdAt);
    labels.push(`#${index + 1} · ${date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`);
    values.push(Number(running.toFixed(2)));
  });

  return { labels, values };
}

/** Calcule le drawdown maximum (en %) à partir de la courbe d'équité. */
function computeMaxDrawdown(equityValues) {
  let peak = equityValues[0] ?? 0;
  let maxDrawdownPct = 0;

  for (const value of equityValues) {
    if (value > peak) peak = value;
    if (peak > 0) {
      const drawdownPct = ((peak - value) / peak) * 100;
      if (drawdownPct > maxDrawdownPct) maxDrawdownPct = drawdownPct;
    }
  }

  return maxDrawdownPct;
}

/**
 * Calcule le ratio Risque/Récompense moyen à partir des niveaux
 * planifiés (entrée, stop loss, take profit) de chaque trade qui les
 * renseigne. Ignore les trades incomplets sur ces champs.
 */
function computeAverageRiskReward(trades) {
  const ratios = trades
    .filter((t) => t.entry != null && t.stopLoss != null && t.takeProfit != null)
    .map((t) => {
      const risk = Math.abs(t.entry - t.stopLoss);
      const reward = Math.abs(t.takeProfit - t.entry);
      return risk > 0 ? reward / risk : null;
    })
    .filter((ratio) => ratio !== null && isFinite(ratio));

  if (ratios.length === 0) return 0;
  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
}

/**
 * Calcule l'ensemble des indicateurs de performance à partir des trades.
 * @param {Array<object>} trades
 * @param {number} startingCapital
 */
export function computeStats(trades, startingCapital = DEFAULT_STARTING_CAPITAL) {
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "WIN");
  const losses = trades.filter((t) => t.result === "LOSS");

  const totalProfit = trades.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
  const grossWin = wins.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (Number(t.profit) || 0), 0));

  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
  const avgWin = wins.length > 0 ? grossWin / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

  const bestTrade = trades.reduce((max, t) => Math.max(max, Number(t.profit) || 0), 0);
  const worstTrade = trades.reduce((min, t) => Math.min(min, Number(t.profit) || 0), 0);

  const { values: equityValues } = buildEquityCurve(trades, startingCapital);
  const maxDrawdown = computeMaxDrawdown(equityValues);
  const currentBalance = startingCapital + totalProfit;

  const riskRewardAvg = computeAverageRiskReward(trades);

  // Espérance mathématique : gain moyen attendu par trade, tous résultats confondus.
  const winRateDecimal = totalTrades > 0 ? wins.length / totalTrades : 0;
  const lossRateDecimal = totalTrades > 0 ? losses.length / totalTrades : 0;
  const expectancy = (winRateDecimal * avgWin) - (lossRateDecimal * avgLoss);

  return {
    currentBalance,
    totalProfit,
    totalTrades,
    winCount: wins.length,
    lossCount: losses.length,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    bestTrade,
    worstTrade,
    maxDrawdown,
    grossWin,
    grossLoss,
    riskRewardAvg,
    expectancy
  };
}