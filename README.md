# JTrader — Journal de Trading Professionnel PhASE I

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore, Storage) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ⬜ Phase 2 — Dashboard
- ⬜ Phase 3 — Gestion des trades
- ⬜ Phase 4 — Historique
- ⬜ Phase 5 — Statistiques
- ⬜ Phase 6 — Graphiques
- ⬜ Phase 7 — Calendrier
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles, ou via `firebase deploy --only firestore:rules` si tu utilises la CLI).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 1)

```
JTrader/
├── index.html          # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html       # Placeholder protégé — sera remplacé en Phase 2
├── assets/
│   ├── css/custom.css   # Design tokens + composants (glassmorphism, boutons, toasts...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       └── utils/{constants,helpers,notifications}.js
└── firebase/firestore.rules
```
# JTrader — Journal de Trading Professionnel PHASE II

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore, Storage) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ⬜ Phase 3 — Gestion des trades
- ⬜ Phase 4 — Historique
- ⬜ Phase 5 — Statistiques
- ⬜ Phase 6 — Graphiques
- ⬜ Phase 7 — Calendrier
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles, ou via `firebase deploy --only firestore:rules` si tu utilises la CLI).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 2)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js
│       ├── services/{firestore,statisticsService}.js   # partagés avec Phase 5
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : le dashboard lit `users/{uid}/trades` — tant que la Phase 3 (formulaire
d'ajout de trade) n'est pas construite, la collection est vide et le dashboard
affiche un état vide ("Aucun trade enregistré").

# JTrader — Journal de Trading Professionnel PHASE 3

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ✅ **Phase 3 — Gestion des trades** (formulaire complet, critères SMC — sans upload de screenshots, voir note ci-dessous)
- ⬜ Phase 4 — Historique
- ⬜ Phase 5 — Statistiques
- ⬜ Phase 6 — Graphiques
- ⬜ Phase 7 — Calendrier
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

> **Note Storage** : depuis février 2026, Firebase Cloud Storage exige le plan payant
> Blaze (carte liée), même pour un usage gratuit sous 5 Go. L'upload de screenshots
> avant/après trade a donc été retiré du formulaire pour rester 100% gratuit (plan
> Spark). Les champs `screenshotBefore`/`screenshotAfter` restent à `null` dans
> Firestore — si tu passes un jour sur Blaze, la fonctionnalité peut être réactivée
> sans changer le modèle de données.

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles > coller > Publier).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 3)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── add-trade.html        # Formulaire complet (SMC)
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts, toggle direction...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js
│       ├── trades/{addTrade,tradeService}.js            # tradeService réutilisé en Phase 4 (édition/suppression)
│       ├── services/{firestore,statisticsService}.js
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : `tradeService.js` expose déjà `updateTrade()` et `deleteTrade()`, prêts à être
branchés sur l'interface d'édition/suppression de la Phase 4 (historique).

# JTrader — Journal de Trading Professionnel PHASE 4

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ✅ **Phase 3 — Gestion des trades** (formulaire complet, critères SMC — sans upload de screenshots, voir note ci-dessous)
- ✅ **Phase 4 — Historique** (recherche, filtres, tri par colonne, pagination, modifier/supprimer)
- ⬜ Phase 5 — Statistiques
- ⬜ Phase 6 — Graphiques
- ⬜ Phase 7 — Calendrier
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

> **Note Storage** : depuis février 2026, Firebase Cloud Storage exige le plan payant
> Blaze (carte liée), même pour un usage gratuit sous 5 Go. L'upload de screenshots
> avant/après trade a donc été retiré du formulaire pour rester 100% gratuit (plan
> Spark). Les champs `screenshotBefore`/`screenshotAfter` restent à `null` dans
> Firestore — si tu passes un jour sur Blaze, la fonctionnalité peut être réactivée
> sans changer le modèle de données.

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles > coller > Publier).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 4)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── add-trade.html        # Formulaire complet (SMC) — création ET édition (?id=...)
├── trades.html           # Historique : recherche, filtres, tri, pagination
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts, toggle direction...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js
│       ├── trades/{addTrade,editTrade,deleteTrade,listTrades,tradeService}.js
│       ├── services/{firestore,statisticsService}.js
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : `add-trade.html?id=xxx` (lien crayon depuis l'historique) réutilise le même
formulaire qu'à la création — `editTrade.js` gère le pré-remplissage et la logique
de sauvegarde spécifique (recalcul du résultat WIN/LOSS et du capital de CE trade
uniquement, sans cascade sur les trades suivants — le dashboard et les statistiques
recalculent toujours l'intégralité de la courbe à partir des profits bruts).

# JTrader — Journal de Trading Professionnel PHASE 5

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ✅ **Phase 3 — Gestion des trades** (formulaire complet, critères SMC — sans upload de screenshots, voir note ci-dessous)
- ✅ **Phase 4 — Historique** (recherche, filtres, tri par colonne, pagination, modifier/supprimer)
- ✅ **Phase 5 — Statistiques** (Vue d'ensemble, Performance financière, Ratios & Risque)
- ⬜ Phase 6 — Graphiques
- ⬜ Phase 7 — Calendrier
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

> **Note Storage** : depuis février 2026, Firebase Cloud Storage exige le plan payant
> Blaze (carte liée), même pour un usage gratuit sous 5 Go. L'upload de screenshots
> avant/après trade a donc été retiré du formulaire pour rester 100% gratuit (plan
> Spark). Les champs `screenshotBefore`/`screenshotAfter` restent à `null` dans
> Firestore — si tu passes un jour sur Blaze, la fonctionnalité peut être réactivée
> sans changer le modèle de données.

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles > coller > Publier).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 5)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── add-trade.html        # Formulaire complet (SMC) — création ET édition (?id=...)
├── trades.html           # Historique : recherche, filtres, tri, pagination
├── statistics.html       # Vue d'ensemble, Performance financière, Ratios & Risque
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts, toggle direction...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js
│       ├── trades/{addTrade,editTrade,deleteTrade,listTrades,tradeService}.js
│       ├── statistics/statistics.js               # graphiques (equityCurve, performance...) en Phase 6
│       ├── services/{firestore,statisticsService}.js
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : `computeStats()` calcule désormais aussi `riskRewardAvg` (moyenne des ratios
R:R planifiés à partir d'entrée/SL/TP) et `expectancy` (espérance de gain par trade),
en plus des indicateurs déjà utilisés par le dashboard.

# JTrader — Journal de Trading Professionnel PHASE 6

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ✅ **Phase 3 — Gestion des trades** (formulaire complet, critères SMC — sans upload de screenshots, voir note ci-dessous)
- ✅ **Phase 4 — Historique** (recherche, filtres, tri par colonne, pagination, modifier/supprimer)
- ✅ **Phase 5 — Statistiques** (Vue d'ensemble, Performance financière, Ratios & Risque)
- ✅ **Phase 6 — Graphiques** (courbe d'équité, histogramme P/L, gains mensuels, WIN/LOSS, par instrument)
- ⬜ Phase 7 — Calendrier
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

> **Note Storage** : depuis février 2026, Firebase Cloud Storage exige le plan payant
> Blaze (carte liée), même pour un usage gratuit sous 5 Go. L'upload de screenshots
> avant/après trade a donc été retiré du formulaire pour rester 100% gratuit (plan
> Spark). Les champs `screenshotBefore`/`screenshotAfter` restent à `null` dans
> Firestore — si tu passes un jour sur Blaze, la fonctionnalité peut être réactivée
> sans changer le modèle de données.

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles > coller > Publier).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 6)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── add-trade.html        # Formulaire complet (SMC) — création ET édition (?id=...)
├── trades.html           # Historique : recherche, filtres, tri, pagination
├── statistics.html       # Vue d'ensemble, Performance, Ratios + 5 graphiques Chart.js
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts, toggle direction...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js         # charts.renderEquityCurve réutilisé en Phase 6
│       ├── trades/{addTrade,editTrade,deleteTrade,listTrades,tradeService}.js
│       ├── statistics/{statistics,charts}.js
│       ├── services/{firestore,statisticsService}.js
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : la courbe d'équité de `statistics.html` réutilise directement
`dashboard/charts.js::renderEquityCurve` (aucune duplication). Les 4 autres
graphiques (histogramme P/L, gains mensuels, répartition WIN/LOSS, performance
par instrument) vivent dans `statistics/charts.js`, calculés en mémoire à
partir des mêmes trades déjà chargés — aucune nouvelle requête Firestore.


# JTrader — Journal de Trading Professionnel PHASE 7

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ✅ **Phase 3 — Gestion des trades** (formulaire complet, critères SMC — sans upload de screenshots, voir note ci-dessous)
- ✅ **Phase 4 — Historique** (recherche, filtres, tri par colonne, pagination, modifier/supprimer)
- ✅ **Phase 5 — Statistiques** (Vue d'ensemble, Performance financière, Ratios & Risque)
- ✅ **Phase 6 — Graphiques** (courbe d'équité, histogramme P/L, gains mensuels, WIN/LOSS, par instrument)
- ✅ **Phase 7 — Calendrier** (navigation mensuelle, jours verts/rouges, détail par jour)
- ⬜ Phase 8 — Profil
- ⬜ Phase 9 — Paramètres
- ⬜ Phase 10 — Export

> **Note Storage** : depuis février 2026, Firebase Cloud Storage exige le plan payant
> Blaze (carte liée), même pour un usage gratuit sous 5 Go. L'upload de screenshots
> avant/après trade a donc été retiré du formulaire pour rester 100% gratuit (plan
> Spark). Les champs `screenshotBefore`/`screenshotAfter` restent à `null` dans
> Firestore — si tu passes un jour sur Blaze, la fonctionnalité peut être réactivée
> sans changer le modèle de données.

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles > coller > Publier).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 7)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── add-trade.html        # Formulaire complet (SMC) — création ET édition (?id=...)
├── trades.html           # Historique : recherche, filtres, tri, pagination
├── statistics.html       # Vue d'ensemble, Performance, Ratios + 5 graphiques Chart.js
├── calendar.html         # Calendrier mensuel : jours verts/rouges + détail par jour
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts, calendrier...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js
│       ├── trades/{addTrade,editTrade,deleteTrade,listTrades,tradeService}.js
│       ├── statistics/{statistics,charts}.js
│       ├── calendar/calendar.js
│       ├── services/{firestore,statisticsService}.js
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : le calendrier regroupe les trades par jour calendaire local (pas UTC, pour
éviter tout décalage de fuseau horaire) directement en mémoire à partir des trades
déjà chargés — aucune nouvelle requête Firestore par mois affiché.



# JTrader — Journal de Trading Professionnel PHase  9

Journal de trading moderne (SMC-focused) inspiré de TraderSync, Edgewonk et TradeZella.

## Stack
HTML5 · Tailwind CSS · JavaScript ES6 Modules · Chart.js · Firebase (Auth, Firestore) · GitHub Pages

## État d'avancement
- ✅ **Phase 1 — Authentification** (login, register, protection des routes, déconnexion)
- ✅ **Phase 2 — Dashboard** (sidebar/navbar partagées, 5 KPIs, courbe d'équité, derniers trades)
- ✅ **Phase 3 — Gestion des trades** (formulaire complet, critères SMC — sans upload de screenshots, voir note ci-dessous)
- ✅ **Phase 4 — Historique** (recherche, filtres, tri par colonne, pagination, modifier/supprimer)
- ✅ **Phase 5 — Statistiques** (Vue d'ensemble, Performance financière, Ratios & Risque)
- ✅ **Phase 6 — Graphiques** (courbe d'équité, histogramme P/L, gains mensuels, WIN/LOSS, par instrument)
- ✅ **Phase 7 — Calendrier** (navigation mensuelle, jours verts/rouges, détail par jour)
- ✅ **Phase 8 — Profil** (nom, email, date d'inscription, édition nom + photo via URL)
- ✅ **Phase 9 — Paramètres** (Dark Mode, capital de départ, devise, fuseau horaire, objectif mensuel)
- ⬜ Phase 10 — Export

> **Note Storage** : depuis février 2026, Firebase Cloud Storage exige le plan payant
> Blaze (carte liée), même pour un usage gratuit sous 5 Go. L'upload de screenshots
> avant/après trade a donc été retiré du formulaire pour rester 100% gratuit (plan
> Spark). Les champs `screenshotBefore`/`screenshotAfter` restent à `null` dans
> Firestore — si tu passes un jour sur Blaze, la fonctionnalité peut être réactivée
> sans changer le modèle de données.

## Configuration Firebase (obligatoire avant de tester)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Active **Authentication > Email/Password**.
3. Crée une base **Firestore Database** (mode production).
4. Copie la config de ton app web dans `assets/js/config/firebase.js` (remplace les `YOUR_...`).
5. Déploie les règles de `firebase/firestore.rules` (Console Firebase > Firestore > Règles > coller > Publier).

## Lancer le projet en local

Comme le projet utilise des modules ES6 (`import`/`export`), il doit être servi par un serveur HTTP — l'ouverture directe du fichier (`file://`) ne fonctionnera pas.

```bash
# Avec Python
python3 -m http.server 5500

# Ou avec l'extension VS Code "Live Server"
```

Puis ouvre `http://localhost:5500/login.html`.

## Structure (Phase 7)

```
JTrader/
├── index.html            # Redirige vers login ou dashboard selon la session
├── login.html
├── register.html
├── dashboard.html        # Sidebar/navbar + 5 KPIs + courbe d'équité + derniers trades
├── add-trade.html        # Formulaire complet (SMC) — création ET édition (?id=...)
├── trades.html           # Historique : recherche, filtres, tri, pagination
├── statistics.html       # Vue d'ensemble, Performance, Ratios + 5 graphiques Chart.js
├── calendar.html         # Calendrier mensuel : jours verts/rouges + détail par jour
├── assets/
│   ├── css/custom.css    # Design tokens + composants (glassmorphism, boutons, toasts, calendrier...)
│   └── js/
│       ├── config/firebase.js
│       ├── auth/{login,register,logout,authGuard}.js
│       ├── dashboard/{dashboard,cards,charts}.js
│       ├── trades/{addTrade,editTrade,deleteTrade,listTrades,tradeService}.js
│       ├── statistics/{statistics,charts}.js
│       ├── calendar/calendar.js
│       ├── services/{firestore,statisticsService}.js
│       └── utils/{constants,helpers,notifications,formatter,layout}.js
└── firebase/firestore.rules
```

Note : le calendrier regroupe les trades par jour calendaire local (pas UTC, pour
éviter tout décalage de fuseau horaire) directement en mémoire à partir des trades
déjà chargés — aucune nouvelle requête Firestore par mois affiché.