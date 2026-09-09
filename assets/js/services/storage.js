/**
 * storage.js — Service d'upload vers Firebase Storage.
 * Utilisé pour les screenshots avant/après trade (Phase 3), et
 * réutilisable plus tard pour la photo de profil (Phase 8).
 */

import { storage } from "../config/firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

/**
 * Upload un fichier image vers un chemin donné et retourne son URL
 * de téléchargement.
 * @param {string} path - ex: "users/{uid}/trades/{tradeId}/before.jpg"
 * @param {File} file
 * @returns {Promise<string>} URL publique de téléchargement
 */
export async function uploadFile(path, file) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/** Upload un screenshot de trade (avant ou après entrée). */
export async function uploadTradeScreenshot(uid, tradeId, file, type) {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `users/${uid}/trades/${tradeId}/${type}.${extension}`;
  return uploadFile(path, file);
}

/** Supprime un fichier de Storage à partir de son chemin (best-effort). */
export async function deleteFile(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    // On ignore silencieusement si le fichier n'existe déjà plus.
    console.warn("[JTrader] Suppression Storage ignorée :", error.code);
  }
}