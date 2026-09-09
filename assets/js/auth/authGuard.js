/**
 * ==========================================================================
 * authGuard.js — Protection des pages selon l'état d'authentification
 * ==========================================================================
 * Deux usages :
 *
 * 1) requireAuth() : à appeler en haut des pages protégées (dashboard,
 *    trades, statistics, calendar, profile, settings...). Redirige vers
 *    login.html si aucun utilisateur n'est connecté. Résout la promesse
 *    avec l'utilisateur Firebase une fois confirmé.
 *
 * 2) redirectIfAuthenticated() : à appeler sur login.html/register.html
 *    pour renvoyer un utilisateur déjà connecté directement vers le
 *    dashboard, évitant qu'il revoie l'écran de connexion.
 * ==========================================================================
 */

import { auth } from "../config/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { ROUTES } from "../utils/constants.js";

/**
 * Affiche un voile de chargement plein écran pendant la vérification
 * de session, pour éviter un flash de contenu protégé avant redirection.
 */
function showAuthCheckOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "jt-auth-overlay";
  overlay.className = "fixed inset-0 z-[200] flex items-center justify-center jt-bg-grid";
  overlay.innerHTML = `<div class="jt-spinner" style="width:2rem;height:2rem;border-width:3px;"></div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function removeAuthCheckOverlay(overlay) {
  if (overlay && overlay.parentNode) overlay.remove();
}

/** À utiliser sur toute page qui exige un utilisateur connecté. */
export function requireAuth() {
  const overlay = showAuthCheckOverlay();
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.replace(ROUTES.LOGIN);
        return;
      }
      removeAuthCheckOverlay(overlay);
      resolve(user);
    });
  });
}

/**
 * À utiliser sur login.html / register.html.
 * IMPORTANT : ne vérifie l'état d'authentification qu'UNE SEULE FOIS
 * (au chargement de la page), puis se désabonne immédiatement.
 * Sans ce désabonnement, ce listener resterait actif pendant toute la
 * durée de vie de la page et se redéclencherait dès qu'un nouvel
 * utilisateur se connecte automatiquement après son inscription —
 * provoquant une redirection prématurée vers le dashboard AVANT que
 * register.js ait eu le temps de créer le document Firestore associé.
 */
export function redirectIfAuthenticated() {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    if (user) {
      window.location.replace(ROUTES.DASHBOARD);
    }
  });
}