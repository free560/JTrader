/**
 * register.js — Gère la soumission du formulaire d'inscription.
 * Crée le compte Firebase Auth, met à jour le displayName, puis initialise
 * le document de profil Firestore correspondant (users/{uid}).
 */

import { auth, db } from "../config/firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { redirectIfAuthenticated } from "./authGuard.js";
import { isValidEmail, isValidPassword, setFieldError, setButtonLoading, initPasswordToggle } from "../utils/helpers.js";
import { showToast } from "../utils/notifications.js";
import { getAuthErrorMessage, ROUTES, COLLECTIONS } from "../utils/constants.js";

redirectIfAuthenticated();

const form = document.getElementById("register-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");

const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const confirmError = document.getElementById("confirm-error");

const submitBtn = document.getElementById("register-submit");
const togglePasswordBtn = document.getElementById("toggle-password");
const togglePasswordIcon = document.getElementById("toggle-password-icon");

if (togglePasswordBtn) {
  initPasswordToggle(togglePasswordBtn, passwordInput, togglePasswordIcon);
}

function validate() {
  let valid = true;

  if (nameInput.value.trim().length < 2) {
    setFieldError(nameInput, nameError, "Entre ton nom complet.");
    valid = false;
  } else {
    setFieldError(nameInput, nameError, "");
  }

  if (!isValidEmail(emailInput.value)) {
    setFieldError(emailInput, emailError, "Entre une adresse email valide.");
    valid = false;
  } else {
    setFieldError(emailInput, emailError, "");
  }

  if (!isValidPassword(passwordInput.value)) {
    setFieldError(passwordInput, passwordError, "Au moins 6 caractères.");
    valid = false;
  } else {
    setFieldError(passwordInput, passwordError, "");
  }

  if (confirmInput.value !== passwordInput.value || !confirmInput.value) {
    setFieldError(confirmInput, confirmError, "Les mots de passe ne correspondent pas.");
    valid = false;
  } else {
    setFieldError(confirmInput, confirmError, "");
  }

  return valid;
}

/** Crée le document de profil initial dans Firestore pour ce nouvel utilisateur. */
async function createUserProfileDocument(user, displayName) {
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  await setDoc(userRef, {
    profile: {
      name: displayName,
      email: user.email,
      photoURL: null,
      createdAt: serverTimestamp()
    },
    settings: {
      darkMode: true,
      currency: "USD",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      monthlyGoal: 0
    }
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setButtonLoading(submitBtn, true, "Création du compte...");

  try {
    const displayName = nameInput.value.trim();
    const credentials = await createUserWithEmailAndPassword(
      auth,
      emailInput.value.trim(),
      passwordInput.value
    );

    await updateProfile(credentials.user, { displayName });
    await createUserProfileDocument(credentials.user, displayName);

    showToast("Compte créé avec succès. Bienvenue !", "success", 1500);
    window.location.href = ROUTES.DASHBOARD;
  } catch (error) {
    console.error("[JTrader] Erreur d'inscription :", error);
    showToast(getAuthErrorMessage(error.code), "error");
    setButtonLoading(submitBtn, false);
  }
});