# Architecture du Frontend

## Stack technique

| Technologie | Version | Role |
|-------------|---------|------|
| TypeScript | 5.9 | Langage |
| Vite | 7.3 | Build tool + dev server |
| Tailwind CSS | 4.1 | Styling utilitaire |
| Jest | 30 | Tests unitaires (jsdom) |

Pas de framework (React, Vue, etc.) : le front est en **Vanilla TypeScript**. Chaque composant est une fonction qui retourne `{ html: string, mount: () => void }`.

## Structure des dossiers

```
front/src/
├── main.ts                    # Point d'entree (importe les styles + lance startApp)
├── app.ts                     # Recupere #app et initialise le router
├── router/
│   ├── index.ts               # Routing SPA (regex, pushState, popstate)
│   └── protect.ts             # Controle d'acces aux routes
├── api/
│   ├── client.ts              # Wrapper fetch avec injection CSRF
│   ├── auth.api.ts            # register, login, logout, getCurrentUser
│   ├── product.api.ts         # listProducts, createProduct, updateProduct, deleteProduct
│   ├── cartApi.ts             # getCart, addItem, updateItem, removeItem, syncCart
│   ├── stats.api.ts           # listStats
│   └── cspReport.api.ts       # listCspReports
├── services/
│   ├── auth.service.ts        # Etat auth (localStorage) + validation session
│   ├── cart.service.ts        # Etat panier (localStorage) + sync serveur
│   ├── product.service.ts     # Filtrage et formatage produits
│   ├── stats.service.ts       # Calculs statistiques
│   └── cspReport.service.ts   # Transformation rapports CSP
├── mappers/
│   ├── product.presenter.ts   # Product -> vue carte
│   ├── stats.presenter.ts     # Stats -> vue liste
│   └── cspReport.presenter.ts # CspReport -> vue tableau
├── pages/
│   ├── Home.ts                # Liste produits + formulaire CRUD + panier
│   ├── Product.ts             # Detail d'un produit
│   ├── Login.ts               # Formulaire connexion
│   ├── Register.ts            # Formulaire inscription
│   ├── Dashboard.ts           # Tableau de bord utilisateur
│   ├── Cart.ts                # Panier
│   ├── Stats.ts               # Statistiques par categorie
│   └── CspReports.ts          # Rapports de violations CSP
├── components/
│   ├── Navbar.ts              # Barre de navigation
│   ├── Footer.ts              # Pied de page
│   ├── ProductCard.ts         # Carte produit
│   ├── SearchBar.ts           # Barre de recherche
│   └── StatList.ts            # Liste de stats
├── config/
│   └── env.ts                 # VITE_API_URL
├── constants/
│   ├── api.constant.ts        # BASE_URL = API_URL + /api/v1
│   └── auth.constant.ts       # Cles localStorage
├── lib/
│   └── utils.ts               # Fonctions utilitaires
└── styles/
    └── main.css               # Imports Tailwind + styles globaux
```

## Pattern composant `{ html, mount }`

Chaque page et composant suit le meme pattern :

```typescript
const MonComposant = () => {
  const html = `<div>...</div>`;

  const mount = () => {
    // Bindage des event listeners sur le DOM
    document.getElementById("mon-btn")?.addEventListener("click", () => { ... });
  };

  return { html, mount };
};
```

1. `html` : string HTML pure (template literal)
2. `mount()` : fonction appelee apres injection dans le DOM pour binder les evenements

Le router injecte le HTML dans `#view`, puis appelle `mount()`.

## Routing SPA

### Definition des routes (`router/index.ts`)

Les routes sont definies par des **regex** avec des groupes nommes pour les parametres :

```typescript
const routes: Route[] = [
  { path: /^\/$/, getView: () => Home() },
  { path: /^\/product\/(?<id>[^/]+)$/, getView: (params) => Product(params.id) },
  { path: /^\/login$/, getView: () => Login() },
  // ...
];
```

### Navigation

- **Liens internes** : attribut `data-link` sur les `<a>`. Un listener global intercepte le clic, appelle `pushState`, et re-rend la route.
- **Bouton retour** : ecoute `popstate` pour re-rendre la route courante.
- **Navigation programmatique** : `pushState` + dispatch `PopStateEvent`.

```typescript
// Clic sur un lien data-link
document.body.addEventListener("click", (event) => {
  const link = target?.closest("[data-link]");
  if (!link) return;
  event.preventDefault();
  window.history.pushState({}, "", link.href);
  void renderRoute();
});
```

### Cycle de rendu

```
URL change (clic data-link ou popstate)
    |
    v
checkRouteAccess(pathname)      # Redirection si non autorise
    |
    v
matchRoute(pathname)            # Regex matching
    |
    v
Navbar.html + route.getView()   # Construction HTML
    |
    v
container.innerHTML = html      # Injection dans le DOM
    |
    v
navbar.mount() + view.mount()   # Bindage des evenements
```

## Protection des routes (`router/protect.ts`)

Trois niveaux d'acces :

| Niveau | Routes | Comportement |
|--------|--------|-------------|
| `public` | `/`, `/product/:id`, `/stats` | Accessible a tous |
| `protected` | `/dashboard`, `/csp-reports` | Non connecte -> redirige vers `/login` |
| `auth-only` | `/login`, `/register` | Connecte -> redirige vers `/` |

```typescript
const protectedRoutes: Record<string, ProtectionLevel> = {
    "/dashboard": "protected",
    "/csp-reports": "protected",
    "/login": "auth-only",
    "/register": "auth-only",
};
```

## Gestion de l'etat

Pas de store global (Redux, Zustand, etc.). L'etat est gere localement :

| Donnee | Stockage | Module |
|--------|----------|--------|
| Utilisateur connecte | `localStorage` (`auth_user`) | `authService` |
| Panier | `localStorage` + sync session serveur | `cartService` |
| Produits charges | Variable locale dans `Home.ts` | `HomeState` |

### Exemple : etat dans Home.ts

```typescript
type HomeState = {
  products: Product[];
  query: string;
  editingId: string | null;
};

let state = initialState;

// Mise a jour immutable
state = setState(state, { query: "table" });
repaint(); // Re-rend le HTML + rebind les evenements
```

## Configuration

| Variable | Fichier | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `.env` | URL du backend (defaut: `http://localhost:5000`) |

La variable est lue via `import.meta.env.VITE_API_URL` et exposee dans `config/env.ts`.

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev Vite (port 3000) |
| `npm run build` | Compilation TypeScript + build Vite |
| `npm run preview` | Preview du build de production |
| `npm run lint` | ESLint sur `src/` |
| `npm test` | Tests Jest (jsdom) |
