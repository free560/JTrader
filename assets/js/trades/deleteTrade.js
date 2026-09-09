/**
 * deleteTrade.js — Suppression d'un trade avec confirmation utilisateur.
 * Séparé de tradeService.js (accès CRUD brut) pour isoler l'UX de
 * confirmation, réutilisable depuis l'historique (Phase 4) et plus tard
 * depuis la fiche détail d'un trade si besoin.
 */

import { deleteTrade as deleteTradeDoc } from "./tradeService.js";
import { showToast } from "../utils/notifications.js";

/**
 * Demande confirmation puis supprime le trade si confirmé.
 * @returns {Promise<boolean>} true si le trade a bien été supprimé
 */
export async function confirmAndDeleteTrade(uid, tradeId, label) {
  const confirmed = window.confirm(
    `Supprimer le trade ${label} ? Cette action est irréversible.`
  );
  if (!confirmed) return false;

  try {
    await deleteTradeDoc(uid, tradeId);
    showToast("Trade supprimé.", "success");
    return true;
  } catch (error) {
    console.error("[JTrader] Erreur lors de la suppression du trade :", error);
    showToast("Impossible de supprimer ce trade. Réessaie.", "error");
    return false;
  }
}