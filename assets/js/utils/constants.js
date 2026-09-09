/**
 * Constantes globales de JTrader.
 * Centraliser ces valeurs évite les chaînes de caractères "magiques"
 * dispersées dans le code et facilite la maintenance.
 */

export const ROUTES = {
  LOGIN: "login.html",
  REGISTER: "register.html",
  DASHBOARD: "dashboard.html",
  TRADES: "trades.html",
  ADD_TRADE: "add-trade.html",
  STATISTICS: "statistics.html",
  CALENDAR: "calendar.html",
  PROFILE: "profile.html",
  SETTINGS: "settings.html"
};

// Capital de départ utilisé tant que l'utilisateur n'a pas défini le sien
// dans Paramètres (Phase 9). Sert de base au calcul du solde actuel.
export const DEFAULT_STARTING_CAPITAL = 10000;

// Chemins des collections/sous-collections Firestore : users/{uid}/...
export const COLLECTIONS = {
  USERS: "users",
  TRADES: "trades",
  SETTINGS: "settings",
  STATISTICS: "statistics"
};

export const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "Adresse email invalide.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/user-not-found": "Aucun compte ne correspond à cet email.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/too-many-requests": "Trop de tentatives. Réessaie dans quelques minutes.",
  "auth/network-request-failed": "Problème de connexion réseau."
};

export function getAuthErrorMessage(code) {
  return AUTH_ERROR_MESSAGES[code] || "Une erreur est survenue. Réessaie.";
}

// Instruments proposés dans le formulaire d'ajout de trade, groupés par
// catégorie. "Autre" permet toujours de saisir un instrument personnalisé.
export const INSTRUMENT_GROUPS = [
  {
    label: "Indices synthétiques",
    options: ["Boom 1000", "Boom 500", "Crash 1000", "Crash 500", "Volatility 75", "Volatility 100"]
  },
  {
    label: "Forex",
    options: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "XAU/USD"]
  },
  {
    label: "Crypto",
    options: ["BTC/USD", "ETH/USD", "SOL/USD"]
  }
];

// Critères Smart Money Concepts pouvant être associés à un trade.
export const SMC_CRITERIA = [
  { key: "bos", label: "BOS", fullLabel: "Break of Structure" },
  { key: "choch", label: "CHoCH", fullLabel: "Change of Character" },
  { key: "fvg", label: "FVG", fullLabel: "Fair Value Gap" },
  { key: "orderBlock", label: "Order Block", fullLabel: "Order Block" },
  { key: "liquidityGrab", label: "Liquidity Grab", fullLabel: "Liquidity Grab" }
];