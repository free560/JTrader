/**
 * firestore.js — Service d'accès générique aux données Firestore.
 * Regroupe les requêtes de lecture réutilisées par plusieurs pages
 * (dashboard, trades, statistics, calendar...).
 */

import { db } from "../config/firebase.js";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { COLLECTIONS } from "../utils/constants.js";

/**
 * Récupère tous les trades d'un utilisateur, triés du plus ancien
 * au plus récent (ordre nécessaire pour construire la courbe d'équité).
 * @param {string} uid
 * @returns {Promise<Array<object>>}
 */
export async function getUserTrades(uid) {
  const tradesRef = collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.TRADES);
  const q = query(tradesRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

/** Récupère le document de profil/paramètres de l'utilisateur. */
export async function getUserDocument(uid) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Met à jour des champs (éventuellement imbriqués via la notation pointée
 * "profile.name") du document utilisateur. Utilisé par la page Profil
 * (Phase 8) et par les Paramètres (Phase 9).
 * @param {string} uid
 * @param {Object<string, any>} updates - ex: { "profile.name": "Free" }
 */
export async function updateUserProfile(uid, updates) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, updates);
}