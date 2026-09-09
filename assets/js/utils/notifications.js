/**
 * Système de toasts (notifications flottantes).
 * Usage : import { showToast } from '../utils/notifications.js';
 *         showToast('Connexion réussie', 'success');
 */

const ICONS = {
  success: "check-circle",
  error: "alert-circle",
  info: "info"
};

function ensureContainer() {
  let container = document.getElementById("jt-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "jt-toast-container";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Affiche un toast temporaire.
 * @param {string} message - Le message à afficher.
 * @param {'success'|'error'|'info'} type - Le type de notification.
 * @param {number} duration - Durée d'affichage en ms.
 */
export function showToast(message, type = "info", duration = 4000) {
  const container = ensureContainer();

  const toast = document.createElement("div");
  toast.className = `jt-toast jt-toast-${type}`;
  toast.innerHTML = `
    <i data-lucide="${ICONS[type] || ICONS.info}" class="w-5 h-5 flex-shrink-0 ${
      type === "success" ? "jt-text-success" : type === "error" ? "jt-text-danger" : "text-blue-400"
    }"></i>
    <span class="jt-text-muted">${message}</span>
  `;

  container.appendChild(toast);

  // Recrée les icônes Lucide fraîchement injectées
  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    toast.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, duration);
}