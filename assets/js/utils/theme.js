/**
 * theme.js — Applique et mémorise la préférence Dark/Light Mode.
 *
 * Deux niveaux de persistance :
 *  - localStorage (par appareil) : permet d'appliquer le bon thème
 *    immédiatement au chargement de la page, avant même que Firebase Auth
 *    ait fini de répondre (évite un flash du mauvais thème).
 *  - Firestore users/{uid}.settings.darkMode (source de vérité, par compte,
 *    synchronisée entre appareils) : appliquée juste après l'authentification
 *    dans authGuard.requireAuth(), qui appelle setTheme() pour réconcilier.
 */

const STORAGE_KEY = "jt-theme";

/** Applique le thème au document et met à jour le cache local. */
export function setTheme(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", "light");
  }
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch (e) {
    // Stockage indisponible (navigation privée stricte, etc.) — non bloquant.
  }
}

/** Lit la préférence mise en cache localement (avant réponse de Firestore). */
export function getCachedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}