/**
 * logout.js — Attache la déconnexion à tout élément portant
 * l'attribut data-action="logout" (bouton sidebar, menu profil, etc.).
 */

import { auth } from "../config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { showToast } from "../utils/notifications.js";
import { ROUTES } from "../utils/constants.js";

export function initLogoutButtons() {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = ROUTES.LOGIN;
      } catch (error) {
        console.error("[JTrader] Erreur de déconnexion :", error);
        showToast("Impossible de se déconnecter. Réessaie.", "error");
      }
    });
  });
}

// Auto-initialisation si le script est chargé directement sur une page.
document.addEventListener("DOMContentLoaded", initLogoutButtons);