/**
 * tradeService.js — Opérations CRUD sur la sous-collection
 * users/{uid}/trades. La création est utilisée dès la Phase 3 ;
 * la mise à jour et la suppression sont prêtes pour la Phase 4
 * (édition/suppression depuis l'historique).
 */

import { db } from "../config/firebase.js";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { COLLECTIONS } from "../utils/constants.js";

/** Génère une référence de document avec un ID pré-assigné (sans écrire). */
export function newTradeRef(uid) {
  return doc(collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.TRADES));
}

/**
 * Crée un trade à l'emplacement de la référence fournie (voir newTradeRef).
 * Pré-générer la référence permet d'uploader les screenshots sous un
 * chemin Storage `.../trades/{tradeId}/...` avant l'écriture Firestore.
 */
export async function createTrade(tradeRef, tradeData) {
  await setDoc(tradeRef, {
    ...tradeData,
    createdAt: tradeData.createdAt || serverTimestamp()
  });
}

export async function updateTrade(uid, tradeId, data) {
  const tradeRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.TRADES, tradeId);
  await updateDoc(tradeRef, data);
}

export async function deleteTrade(uid, tradeId) {
  const tradeRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.TRADES, tradeId);
  await deleteDoc(tradeRef);
}

export async function getTrade(uid, tradeId) {
  const tradeRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.TRADES, tradeId);
  const snap = await getDoc(tradeRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Combine un input date + un input heure en Timestamp Firestore. */
export function combineDateAndTimeToTimestamp(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = (timeValue || "00:00").split(":").map(Number);
  const jsDate = new Date(year, month - 1, day, hours, minutes);
  return Timestamp.fromDate(jsDate);
}