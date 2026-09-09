/**
 * ==========================================================================
 * layout.js — Sidebar & Navbar partagées entre toutes les pages protégées
 * ==========================================================================
 * Évite de dupliquer le markup de navigation sur chaque page (dashboard,
 * trades, statistics, calendar, profile, settings...). Chaque page injecte
 * simplement <div id="jt-sidebar"></div> et <div id="jt-navbar"></div>,
 * puis appelle mountLayout({ activeKey, pageTitle, user }).
 * ==========================================================================
 */

import { ROUTES } from "./constants.js";

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "layout-dashboard", href: ROUTES.DASHBOARD },
  { key: "trades", label: "Trades", icon: "list-ordered", href: ROUTES.TRADES },
  { key: "statistics", label: "Statistiques", icon: "bar-chart-3", href: ROUTES.STATISTICS },
  { key: "calendar", label: "Calendrier", icon: "calendar-days", href: ROUTES.CALENDAR },
  { key: "profile", label: "Profil", icon: "user-round", href: ROUTES.PROFILE },
  { key: "settings", label: "Paramètres", icon: "settings", href: ROUTES.SETTINGS }
];

// Sous-ensemble de NAV_ITEMS affiché dans la barre de navigation mobile
// (en bas d'écran). "Paramètres" reste accessible via la sidebar/menu
// hamburger pour ne pas surcharger la barre mobile à 5 icônes max.
const BOTTOM_NAV_KEYS = ["dashboard", "trades", "statistics", "calendar", "profile"];

function renderSidebar(activeKey) {
  const links = NAV_ITEMS.map((item) => {
    const isActive = item.key === activeKey;
    return `
      <a href="${item.href}"
         class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors
                ${isActive
                  ? "bg-[var(--jt-accent)]/15 text-white border border-[var(--jt-accent)]/25"
                  : "jt-text-muted hover:text-white hover:bg-white/5 border border-transparent"}">
        <i data-lucide="${item.icon}" class="w-[18px] h-[18px]"></i>
        <span class="font-medium">${item.label}</span>
      </a>`;
  }).join("");

  return `
    <div class="h-full flex flex-col p-4">
      <div class="flex items-center justify-between px-2 py-3 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-[var(--jt-accent)]/15 border border-[var(--jt-accent)]/30 flex items-center justify-center">
            <i data-lucide="candlestick-chart" class="w-5 h-5" style="color:var(--jt-accent)"></i>
          </div>
          <span class="font-display font-semibold text-lg tracking-tight">JTrader</span>
        </div>
        <button id="jt-sidebar-close-btn" class="lg:hidden jt-text-muted hover:text-white p-1" aria-label="Fermer le menu">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <nav class="flex flex-col gap-1 flex-1">${links}</nav>

      <button data-action="logout" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm jt-text-muted hover:text-white hover:bg-white/5 transition-colors">
        <i data-lucide="log-out" class="w-[18px] h-[18px]"></i>
        <span class="font-medium">Déconnexion</span>
      </button>
    </div>`;
}

function renderNavbar(pageTitle, user) {
  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();
  const avatar = user?.photoURL
    ? `<img src="${user.photoURL}" alt="" class="w-9 h-9 rounded-full object-cover border border-white/10" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'w-9 h-9 rounded-full bg-[var(--jt-accent)]/20 border border-[var(--jt-accent)]/30 flex items-center justify-center font-display text-sm', textContent: '${initial}' }))" />`
    : `<div class="w-9 h-9 rounded-full bg-[var(--jt-accent)]/20 border border-[var(--jt-accent)]/30 flex items-center justify-center font-display text-sm">${initial}</div>`;

  return `
    <div class="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/5">
      <div class="flex items-center gap-3">
        <button id="jt-mobile-menu-btn" class="lg:hidden jt-text-muted hover:text-white">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        <h1 class="font-display text-lg font-medium">${pageTitle}</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="hidden sm:block text-sm jt-text-muted">${user?.displayName || user?.email || ""}</span>
        ${avatar}
      </div>    </div>`;
}

function renderBottomNav(activeKey) {
  const items = NAV_ITEMS.filter((item) => BOTTOM_NAV_KEYS.includes(item.key));

  const links = items.map((item) => {
    const isActive = item.key === activeKey;
    return `
      <a href="${item.href}"
         class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors
                ${isActive ? "text-white" : "jt-text-muted"}">
        <span class="flex items-center justify-center w-9 h-7 rounded-lg transition-colors
                     ${isActive ? "bg-[var(--jt-accent)]/15" : ""}">
          <i data-lucide="${item.icon}" class="w-[19px] h-[19px]" style="${isActive ? "color:var(--jt-accent)" : ""}"></i>
        </span>
        <span class="text-[10.5px] font-medium leading-none">${item.label}</span>
      </a>`;
  }).join("");

  return `<nav class="flex items-stretch h-full">${links}</nav>`;
}

/**
 * Crée (une seule fois) le fond semi-transparent affiché derrière la
 * sidebar mobile ouverte, et l'ajoute au body s'il n'existe pas déjà.
 * Sans lui, la sidebar ouverte (256px de large) recouvre le bouton
 * hamburger qui se trouve juste en dessous dans la navbar — rendant
 * impossible toute fermeture au clic.
 */
function ensureBackdrop() {
  let backdrop = document.getElementById("jt-sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "jt-sidebar-backdrop";
    backdrop.className = "fixed inset-0 bg-black/60 z-30 hidden lg:hidden transition-opacity";
    document.body.appendChild(backdrop);
  }
  return backdrop;
}

function openSidebar(sidebarWrapper, backdrop) {
  sidebarWrapper.classList.remove("-translate-x-full");
  backdrop.classList.remove("hidden");
}

function closeSidebar(sidebarWrapper, backdrop) {
  sidebarWrapper.classList.add("-translate-x-full");
  backdrop.classList.add("hidden");
}

/**
 * Monte la sidebar + navbar dans la page courante et attache les
 * interactions de base (ouverture/fermeture du menu mobile, icônes Lucide).
 */
export function mountLayout({ activeKey, pageTitle, user }) {
  const sidebarEl = document.getElementById("jt-sidebar");
  const navbarEl = document.getElementById("jt-navbar");
  const bottomNavEl = document.getElementById("jt-bottom-nav");

  if (sidebarEl) sidebarEl.innerHTML = renderSidebar(activeKey);
  if (navbarEl) navbarEl.innerHTML = renderNavbar(pageTitle, user);
  if (bottomNavEl) bottomNavEl.innerHTML = renderBottomNav(activeKey);

  if (window.lucide) window.lucide.createIcons();

  const menuBtn = document.getElementById("jt-mobile-menu-btn");
  const closeBtn = document.getElementById("jt-sidebar-close-btn");
  const sidebarWrapper = document.getElementById("jt-sidebar-wrapper");

  if (!sidebarWrapper) return;

  const backdrop = ensureBackdrop();

  if (menuBtn) {
    menuBtn.addEventListener("click", () => openSidebar(sidebarWrapper, backdrop));
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeSidebar(sidebarWrapper, backdrop));
  }
  // Clic sur le fond sombre → ferme le menu.
  backdrop.addEventListener("click", () => closeSidebar(sidebarWrapper, backdrop));

  // Sélectionner un lien du menu referme automatiquement la sidebar mobile.
  sidebarWrapper.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeSidebar(sidebarWrapper, backdrop));
  });
}