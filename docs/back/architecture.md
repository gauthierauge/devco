# Architecture du Backend

## Stack technique

| Technologie | Version | Role |
|-------------|---------|------|
| Express | 5.2 | Framework HTTP |
| TypeScript | 5.9 | Langage |
| Prisma | 7.4 | ORM + migrations |
| PostgreSQL | 16 | Base de donnees |
| Pino | 10.3 | Logger JSON |
| Jest | 30 | Tests unitaires + integration |

## Structure des dossiers

```
back/src/
├── app.ts                          # Creation de l'app Express + middleware chain
├── index.ts                        # Point d'entree (charge l'env, demarre le serveur)
├── config/
│   ├── cors.ts                     # Configuration CORS (restrictive + ouverte)
│   ├── db.ts                       # Client Prisma + adaptateur PostgreSQL
│   ├── env.ts                      # Parsing et validation des variables d'env
│   ├── helmet.ts                   # Directives CSP + headers securite
│   ├── logger.ts                   # Logger Pino (dev : pretty, prod : JSON)
│   └── routes.ts                   # Enregistrement de toutes les routes
├── middleware/
│   ├── error.ts                    # HttpError, asyncHandler, errorHandler, notFoundHandler
│   ├── requestLogger.ts            # Log des requetes HTTP (methode, url, duree, status)
│   ├── session.ts                  # express-session avec PrismaStore custom
│   ├── upload.ts                   # Parsing multipart + validation images
│   └── security/
│       ├── auth.ts                 # Authentification via session.userId
│       ├── csrf.ts                 # Generation et verification CSRF
│       ├── cspNonce.ts             # Generation de nonce CSP par requete
│       ├── rateLimiter.ts          # Rate limiting global (100 req/15min)
│       ├── reportTo.ts            # Header Report-To pour violations CSP
│       └── xssSanitizer.ts        # Sanitization XSS recursive sur req.body
├── controllers/
│   ├── auth.controller.ts          # register, login, logout, me
│   ├── product.controller.ts       # CRUD produits (list, getById, create, update, remove)
│   ├── cart.controller.ts          # Panier (get, add, update, remove, sync)
│   ├── cspReport.controller.ts     # Reception et liste des rapports CSP
│   └── stats.controller.ts         # Statistiques par categorie
├── services/
│   ├── auth.service.ts             # Register, login, validation password, getCurrentUser
│   ├── product.service.ts          # Filtrage produits, delegation au repository
│   ├── cspReport.service.ts        # Validation payload CSP, cleanup
│   └── stats.service.ts            # Aggregation groupBy Prisma
├── repositories/
│   ├── user.repository.ts          # CRUD User (findByEmail, findById, create)
│   ├── product.repository.ts       # CRUD Product (findMany, findById, create, update, delete)
│   └── cspReport.repository.ts     # CRUD CspReport (create, findMany, deleteMany)
├── routes/
│   ├── auth.route.ts               # POST register/login/logout, GET me
│   ├── product.route.ts            # GET/POST/PUT/DELETE products
│   ├── cart.route.ts               # GET/POST/PUT/DELETE cart
│   ├── cspReport.route.ts          # POST csp-report, GET csp-reports
│   └── stats.route.ts              # GET stats
├── constants/
│   ├── api.constant.ts             # API_PREFIX = "/api/v1"
│   ├── csrf.constant.ts            # Cles session CSRF
│   └── cspReport.constant.ts       # Whitelist champs CSP, MAX_REPORTS = 100
├── types/
│   ├── auth.ts                     # UserResponse
│   └── error.ts                    # ApiError
├── utils/
│   ├── csrf.ts                     # Generation/verification tokens CSRF (lib csrf)
│   ├── password.ts                 # Hash bcrypt + validation
│   └── file.ts                     # Suppression fichiers images orphelins
├── generated/prisma/               # Types auto-generes par Prisma
└── prisma/
    └── schema.prisma               # Schema de la base de donnees
```

## Pattern Route -> Controller -> Service -> Repository

Chaque fonctionnalite suit un pattern en 4 couches avec une separation claire des responsabilites :

```
Route  ->  Controller  ->  Service  ->  Repository
(HTTP)     (req/res)       (metier)     (base de donnees)
```

| Couche | Responsabilite | Exemple |
|--------|---------------|---------|
| **Route** | Definit le verbe HTTP, le path, et les middlewares | `POST /api/v1/products` + `authMiddleware` + `uploadImages` |
| **Controller** | Extrait les donnees de `req`, appelle le service, retourne la reponse | Parse le body, appelle `createProduct()`, retourne `201` |
| **Service** | Validation metier, logique applicative | Verifie les champs, construit les filtres Prisma |
| **Repository** | Operations Prisma (CRUD) | `prisma.product.create()` |

**Exception :** le panier (`cart.controller.ts`) n'a pas de couche service/repository car sa logique est simple (lecture/ecriture directe en session).

### Exemple : creation d'un produit

```
POST /api/v1/products
    |
    v
product.route.ts
    productRouter.post("/products", authMiddleware, uploadImages, create)
    |
    v
upload.ts — uploadImages(req, res, next)
    Parse le multipart, valide les images (MIME + magic number)
    Ecrit les fichiers dans public/uploads/
    Ajoute req.body (champs) et req.files (images)
    |
    v
product.controller.ts — create(req, res)
    Extrait label, description, category, price, images
    Verifie que tous les champs requis sont presents
    Appelle createProduct({ label, description, category, price, images })
    Retourne 201 avec le produit cree
    |
    v
product.service.ts — createProduct(data)
    Delegue au repository
    |
    v
product.repository.ts — createProduct(data)
    prisma.product.create({ data })
```

## Middleware Chain

L'ordre des middlewares dans `app.ts` est critique. Ils s'executent dans cet ordre :

```typescript
// 1. FICHIERS STATIQUES
app.use(express.static("public", { dotfiles: "deny" }))
app.use("/uploads", express.static("public/uploads", { dotfiles: "deny" }))

// 2. SESSION
app.use(sessionMiddleware)              // PrismaStore, httpOnly, sameSite: lax

// 3. PARSING
app.use(express.json({ limit: "10kb" }))
app.use(express.json({ type: "application/csp-report", limit: "5kb" }))

// 4. SECURITE HEADERS
app.use(cspNonceMiddleware)             // Genere res.locals.cspNonce
app.use(csrfGenerateMiddleware)         // Genere le token CSRF en session
app.use(csrfVerifyMiddleware)           // Verifie le CSRF sur POST/PUT/DELETE
app.use(helmet(helmetOptions))          // CSP, HSTS, X-Content-Type-Options, etc.
app.use(reportToMiddleware)             // Header Report-To pour CSP
app.use(cors(corsOptions))              // CORS restrictif

// 5. PROTECTIONS
app.use(globalLimiter)                  // 100 req / 15 min
app.use(xssSanitizer)                   // filterXSS sur req.body

// 6. LOGGING
app.use(requestLogger)                  // Log methode, url, status, duree

// 7. ROUTES
initRoutes(app)                         // Tous les endpoints API

// 8. ERREURS
app.use(notFoundHandler)                // 404
app.use(errorHandler)                   // Catch-all
```

## Configuration environnement

### Variables d'environnement (`env.ts`)

Trois variables sont **requises** au demarrage. Si l'une manque, l'app throw immediatement :

| Variable | Description | Defaut |
|----------|-------------|--------|
| `BACKEND_URL` | URL complete du serveur | `http://localhost:5000` |
| `FRONTEND_URL` | Origine autorisee par CORS | `http://localhost:3000` |
| `DATABASE_URL` | URL de connexion PostgreSQL | — (requis) |
| `LOG_LEVEL` | Niveau de log Pino | `debug` (dev) / `info` (prod) |
| `SESSION_SECRET` | Secret pour signer les cookies de session | `dev-session-secret-...` |

## Logging (Pino)

### Configuration (`config/logger.ts`)

- **Production** : JSON brut (pour ingestion par un service de logs)
- **Developpement** : Sortie formatee avec `pino-pretty` (couleurs, timestamps `HH:MM:ss`)

### Niveaux utilises

| Niveau | Usage |
|--------|-------|
| `debug` | Payload ignore, details internes |
| `info` | Requetes 2xx, operations reussies (login, register) |
| `warn` | Erreurs client 4xx, tentatives echouees (login, password faible) |
| `error` | Erreurs serveur 5xx, erreurs session |

### Donnees logguees par requete (`requestLogger.ts`)

```json
{
  "method": "POST",
  "url": "/api/v1/products",
  "status": 201,
  "duration": "12ms",
  "ip": "::1"
}
```

## Error Handling

### `HttpError`

Classe custom qui etend `Error` avec un `statusCode` :

```typescript
class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string);
}
```

### `asyncHandler`

Wrapper pour les handlers async qui catch automatiquement les erreurs et les passe a `next()` :

```typescript
const asyncHandler = (fn) =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

### `errorHandler`

Middleware global qui intercepte toutes les erreurs :
- `HttpError` : retourne le `statusCode` avec le message
- Autres erreurs : retourne `500` avec `"Erreur interne du serveur"`

### Format de reponse d'erreur

```typescript
interface ApiError {
  error: string;
  details?: string;  // Uniquement en developpement
}
```

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev avec rechargement auto (nodemon + tsx) |
| `npm run build` | Compilation TypeScript + resolution alias (tsc-alias) |
| `npm test` | Lancer tous les tests (Jest + ESM) |
| `npm run lint` | Linter ESLint sur `src/` |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:generate` | Regenerer les types Prisma |
| `npm run db:studio` | Ouvrir Prisma Studio |
