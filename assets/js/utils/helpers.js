/**
 * Fonctions utilitaires génériques partagées par plusieurs modules.
 */

/** Valide un format d'email simple côté client. */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Vérifie qu'un mot de passe respecte la longueur minimale Firebase. */
export function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

/**
 * Affiche un message d'erreur sous un champ de formulaire et applique
 * le style d'erreur à l'input associé.
 */
export function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("jt-input-error");
    errorEl.textContent = message;
  } else {
    inputEl.classList.remove("jt-input-error");
    errorEl.textContent = "";
  }
}

/** Bascule l'état "chargement" d'un bouton de soumission. */
export function setButtonLoading(buttonEl, isLoading, loadingLabel = "Chargement...") {
  if (isLoading) {
    buttonEl.dataset.originalLabel = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = `<span class="jt-spinner"></span><span>${loadingLabel}</span>`;
  } else {
    buttonEl.disabled = false;
    if (buttonEl.dataset.originalLabel) {
      buttonEl.innerHTML = buttonEl.dataset.originalLabel;
    }
  }
}

/** Active/désactive l'affichage en clair d'un champ mot de passe. */
export function initPasswordToggle(toggleBtnEl, inputEl, iconEl) {
  toggleBtnEl.addEventListener("click", () => {
    const isPassword = inputEl.type === "password";
    inputEl.type = isPassword ? "text" : "password";
    iconEl.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
    if (window.lucide) window.lucide.createIcons();
  });
}

/** Retarde l'exécution d'une fonction jusqu'à ce que l'appelant arrête
 * de la déclencher pendant `delay` ms (utile pour la recherche live). */
export function debounce(fn, delay = 250) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}