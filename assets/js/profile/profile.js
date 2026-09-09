/**
 * ==========================================================================
 * profile.js — Point d'entrée de profile.html
 * ==========================================================================
 * Affiche nom, email et date d'inscription (lus depuis Firestore
 * users/{uid}.profile). Permet de modifier le nom et la photo.
 *
 * Note Storage : comme pour les screenshots de trades (Phase 3), l'upload
 * de fichier vers Firebase Storage est évité (plan payant Blaze requis
 * depuis février 2026). La "photo" est donc un simple champ URL — colle
 * un lien vers une image déjà hébergée ailleurs (ex: un lien direct
 * imgur.com) — ce qui reste 100% gratuit (plan Spark).
 * ==========================================================================
 */

import { auth } from "../config/firebase.js";
import { updateProfile as updateAuthProfile } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { requireAuth } from "../auth/authGuard.js";
import { initLogoutButtons } from "../auth/logout.js";
import { mountLayout } from "../utils/layout.js";
import { getUserDocument, updateUserProfile } from "../services/firestore.js";
import { formatDate } from "../utils/formatter.js";
import { setButtonLoading } from "../utils/helpers.js";
import { showToast } from "../utils/notifications.js";

let currentUser = null;
let currentProfile = { name: "", email: "", photoURL: null, createdAt: null };

const avatarDisplay = document.getElementById("profile-avatar-display");
const nameDisplay = document.getElementById("profile-name-display");
const emailDisplay = document.getElementById("profile-email-display");
const createdAtDisplay = document.getElementById("profile-created-at");

const viewMode = document.getElementById("profile-view-mode");
const editBtn = document.getElementById("profile-edit-btn");
const cancelBtn = document.getElementById("profile-cancel-btn");
const form = document.getElementById("profile-form");
const nameInput = document.getElementById("profile-name-input");
const photoInput = document.getElementById("profile-photo-input");
const saveBtn = document.getElementById("profile-save-btn");

/** Construit soit une image, soit un avatar avec l'initiale du nom. */
function avatarTemplate(name, photoURL, sizeClass) {
  const initial = (name || "?").charAt(0).toUpperCase();
  if (photoURL) {
    return `<img src="${photoURL}" alt="Photo de profil" class="${sizeClass} rounded-full object-cover border border-white/10" onerror="this.remove()" />`;
  }
  return `
    <div class="${sizeClass} rounded-full bg-[var(--jt-accent)]/20 border border-[var(--jt-accent)]/30 flex items-center justify-center font-display">
      ${initial}
    </div>`;
}

function renderView() {
  avatarDisplay.innerHTML = avatarTemplate(currentProfile.name, currentProfile.photoURL, "w-20 h-20 text-2xl");
  nameDisplay.textContent = currentProfile.name || "Sans nom";
  emailDisplay.textContent = currentProfile.email || currentUser.email;
  createdAtDisplay.textContent = currentProfile.createdAt
    ? `Membre depuis le ${formatDate(currentProfile.createdAt)}`
    : "Date d'inscription inconnue";
}

function enterEditMode() {
  nameInput.value = currentProfile.name || "";
  photoInput.value = currentProfile.photoURL || "";
  viewMode.classList.add("hidden");
  form.classList.remove("hidden");
}

function exitEditMode() {
  form.classList.add("hidden");
  viewMode.classList.remove("hidden");
}

async function handleSave(e) {
  e.preventDefault();
  const newName = nameInput.value.trim();
  const newPhotoURL = photoInput.value.trim();

  if (!newName) {
    showToast("Le nom ne peut pas être vide.", "error");
    return;
  }

  setButtonLoading(saveBtn, true, "Enregistrement...");

  try {
    await updateUserProfile(currentUser.uid, {
      "profile.name": newName,
      "profile.photoURL": newPhotoURL || null
    });

    await updateAuthProfile(auth.currentUser, {
      displayName: newName,
      photoURL: newPhotoURL || null
    });

    currentProfile.name = newName;
    currentProfile.photoURL = newPhotoURL || null;

    renderView();
    exitEditMode();
    mountLayout({ activeKey: "profile", pageTitle: "Profil", user: auth.currentUser });
    initLogoutButtons();
    showToast("Profil mis à jour avec succès !", "success", 2000);
  } catch (error) {
    console.error("[JTrader] Erreur lors de la mise à jour du profil :", error);
    showToast("Impossible de mettre à jour le profil.", "error");
  } finally {
    setButtonLoading(saveBtn, false);
  }
}

function initControls() {
  editBtn.addEventListener("click", enterEditMode);
  cancelBtn.addEventListener("click", exitEditMode);
  form.addEventListener("submit", handleSave);
}

async function init() {
  currentUser = await requireAuth();
  mountLayout({ activeKey: "profile", pageTitle: "Profil", user: currentUser });
  initLogoutButtons();
  initControls();

  try {
    const userDoc = await getUserDocument(currentUser.uid);
    currentProfile = {
      name: userDoc?.profile?.name || currentUser.displayName || "",
      email: userDoc?.profile?.email || currentUser.email || "",
      photoURL: userDoc?.profile?.photoURL || currentUser.photoURL || null,
      createdAt: userDoc?.profile?.createdAt || null
    };
    renderView();
  } catch (error) {
    console.error("[JTrader] Erreur de chargement du profil :", error);
    showToast("Impossible de charger le profil.", "error");
  }
}

init();