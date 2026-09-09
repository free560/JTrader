/**
 * ==========================================================================
 * JTrader — Configuration Firebase
 * ==========================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";


// Configuration Firebase de JTrader
const firebaseConfig = {
  apiKey: "AIzaSyDc0hokAKkeV9W9ONcqhrp9jBJD5c_dR7k",
  authDomain: "jtrader-cb2fc.firebaseapp.com",
  projectId: "jtrader-cb2fc",
  storageBucket: "jtrader-cb2fc.firebasestorage.app",
  messagingSenderId: "509426872167",
  appId: "1:509426872167:web:a3bcb0b54b2504b02f89c2"
};


// Initialisation de Firebase
const app = initializeApp(firebaseConfig);


// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;