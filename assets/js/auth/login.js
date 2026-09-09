/**
 * login.js — Gère la soumission du formulaire de connexion.
 */

import { auth } from "../config/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { redirectIfAuthenticated } from "./authGuard.js";
import { isValidEmail } from "../utils/helpers.js";
import { setFieldError, setButtonLoading, initPasswordToggle } from "../utils/helpers.js";
import { showToast } from "../utils/notifications.js";
import { getAuthErrorMessage, ROUTES } from "../utils/constants.js";

// Si un utilisateur est déjà connecté, on l'envoie directement au dashboard.
redirectIfAuthenticated();

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const submitBtn = document.getElementById("login-submit");
const togglePasswordBtn = document.getElementById("toggle-password");
const togglePasswordIcon = document.getElementById("toggle-password-icon");

if (togglePasswordBtn) {
  initPasswordToggle(togglePasswordBtn, passwordInput, togglePasswordIcon);
}

function validate() {
  let valid = true;

  if (!isValidEmail(emailInput.value)) {
    setFieldError(emailInput, emailError, "Entre une adresse email valide.");
    valid = false;
  } else {
    setFieldError(emailInput, emailError, "");
  }

  if (!passwordInput.value) {
    setFieldError(passwordInput, passwordError, "Le mot de passe est requis.");
    valid = false;
  } else {
    setFieldError(passwordInput, passwordError, "");
  }

  return valid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setButtonLoading(submitBtn, true, "Connexion...");

  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    showToast("Connexion réussie. Redirection...", "success", 1500);
    window.location.href = ROUTES.DASHBOARD;
  } catch (error) {
    console.error("[JTrader] Erreur de connexion :", error.code);
    showToast(getAuthErrorMessage(error.code), "error");
    setButtonLoading(submitBtn, false);
  }
});