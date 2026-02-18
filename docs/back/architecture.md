# Architecture du Backend

## Structure des dossiers

```
back/
├── src/
│   ├── app.ts                        # Creation de l'app Express + middleware chain
│   ├── index.ts                      # Point d'entree (charge l'env, demarre le serveur)
│   ├── config/
│   │   ├── cors.ts                   # Configuration CORS
│   │   ├── db.ts                     # Client Prisma + adaptateur PostgreSQL
│   │   ├── env.ts                    # Parsing des variables d'environnement
│   │   ├── helmet.ts                 # Directives CSP + headers securite
│   │   ├── logger.ts                 # Logger Pino (dev/production)
│   │   └── routes.ts                 # Enregistrement des routes
│   ├── middleware/
│   │   ├── error.ts                  # HttpError, asyncHandler, errorHandler
│   │   ├── requestLogger.ts          # Log des requetes HTTP (methode, url, duree)
│   │   └── security/
│   │       ├── cspNonce.ts           # Generation de nonce CSP par requete
│   │       └── reportTo.ts           # Header Report-To
│   ├── controllers/                  # Gestion des requetes/reponses HTTP
│   │   └── cspReport.controller.ts
│   ├── services/                     # Logique metier, validation
│   │   └── cspReport.service.ts
│   ├── repositories/                 # Acces base de donnees (Prisma)
│   │   └── cspReport.repository.ts
│   ├── routes/                       # Definition des endpoints
│   │   └── cspReport.route.ts
│   ├── constants/                    # Constantes (whitelist, limites)
│   │   └── cspReport.constant.ts
│   ├── types/                        # Types TypeScript partages
│   │   └── error.ts
│   └── generated/prisma/            # Types auto-generes par Prisma
├── tests/
│   ├── units/                        # Tests unitaires
│   └── integration/                  # Tests d'integration
├── prisma/
│   ├── schema.prisma                 # Schema de la base de donnees
│   └── migrations/                   # Historique des migrations
├── package.json
├── tsconfig.json
├── jest.config.ts
├── eslint.config.js
└── .env.example
```

## Pattern Route -> Controller -> Service -> Repository

Chaque fonctionnalite suit un pattern en 4 couches avec une separation claire des responsabilites :

```
Route  ->  Controller  ->  Service  ->  Repository
(HTTP)     (req/res)       (metier)     (base de donnees)
```

| Couche | Responsabilite | Exemple |
|--------|---------------|---------|
| **Route** | Definit le verbe HTTP et le path, applique les middlewares | `POST /api/csp-report` |
| **Controller** | Extrait les donnees de `req`, appelle le service, retourne la reponse | Extrait `req.body["csp-report"]`, retourne `204` |
| **Service** | Validation metier, logique applicative | Valide le payload CSP, declenche le cleanup |
| **Repository** | Operations Prisma (CRUD) | `prisma.cspReport.create()` |

### Exemple concret : reception d'un rapport CSP

```
POST /api/csp-report
    |
    v
cspReport.route.ts
    Router.post("/api/csp-report", asyncHandler(receiveCspReport))
    |
    v
cspReport.controller.ts — receiveCspReport(req, res)
    Extrait le payload depuis req.body["csp-report"] ou req.body
    Appelle saveCspReport(payload)
    Retourne 204 No Content
    |
    v
cspReport.service.ts — saveCspReport(payload)
    Verifie que le payload est un objet valide
    Verifie les champs requis (document-uri, violated-directive)
    Verifie que seuls les champs autorises sont presents
    Appelle le repository pour sauvegarder
    Declenche le cleanup si > MAX_REPORTS (100)
    |
    v
cspReport.repository.ts — createCspReport(payload)
    prisma.cspReport.create({ data: { payload } })
```

## Middleware Chain

L'ordre des middlewares dans `app.ts` est important. Ils s'executent dans l'ordre suivant :

```typescript
// 1. SECURITE — en premier pour proteger toutes les reponses
app.use(cspNonceMiddleware);        // Genere res.locals.cspNonce
app.use(helmet(helmetOptions));      // CSP, HSTS, headers securite
app.use(reportToMiddleware);         // Header Report-To

// 2. CORS & PARSING
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.json({ type: "application/csp-report" }));

// 3. LOGGING
app.use(requestLogger);

// 4. ROUTES
initRoutes(app);

// 5. GESTION D'ERREURS — en dernier
app.use(notFoundHandler);            // 404 pour les routes non trouvees
app.use(errorHandler);               // Catch-all pour les erreurs
```

## Configuration environnement

### Variables d'environnement (`env.ts`)

| Variable | Description | Defaut |
|----------|-------------|--------|
| `BACKEND_URL` | URL complete du serveur | `http://localhost:5000` |
| `BACKEND_PORT` | Port extrait de `BACKEND_URL` | `5000` |
| `FRONTEND_URL` | Origine autorisee par CORS | `http://localhost:3000` |
| `DATABASE_URL` | URL de connexion PostgreSQL | — |
| `LOG_LEVEL` | Niveau de log Pino | `debug` |

### `.env.example`

```env
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://devco-admin:devco-password@localhost:5432/devco-db"
LOG_LEVEL="debug"
```

## Base de donnees (Prisma)

### Connexion (`config/db.ts`)

Le client Prisma utilise l'adaptateur `@prisma/adapter-pg` pour se connecter a PostgreSQL. Les types sont generes dans `src/generated/prisma/`.

### Modeles (`prisma/schema.prisma`)

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

model CspReport {
  id        Int      @id @default(autoincrement())
  payload   Json
  createdAt DateTime @default(now())
}
```

### Commandes Prisma

```bash
npm run db:migrate    # Appliquer les migrations
npm run db:generate   # Regenerer les types
npm run db:studio     # Interface web Prisma Studio
```

## Logging (Pino)

### Configuration (`config/logger.ts`)

- **Production** : JSON brut (pour ingestion par un service de logs)
- **Developpement** : Sortie formatee avec `pino-pretty` (couleurs, timestamps `HH:MM:ss`)

### Niveaux utilises

| Niveau | Usage |
|--------|-------|
| `debug` | Payload ignore, details internes |
| `info` | Requetes 2xx, operations reussies |
| `warn` | Erreurs client 4xx |
| `error` | Erreurs serveur 5xx |

### Donnees logguees par requete (`requestLogger.ts`)

```json
{
  "method": "POST",
  "url": "/api/csp-report",
  "status": 204,
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

## Tests

### Structure

```
tests/
├── units/
│   ├── cspReport.controller.test.ts   # Controller avec services mockes
│   ├── cspReport.service.test.ts      # Validation et cleanup
│   └── reportTo.middleware.test.ts     # Header Report-To
└── integration/
    └── cspReport.integration.test.ts  # Cycle requete/reponse complet
```

### Strategie de mocking

| Dependance | Mock |
|-----------|------|
| Prisma (DB) | Mock du client Prisma |
| Repository | Mock des fonctions du repository en unit tests |
| Logger | Mock de Pino pour eviter la sortie console |
| HTTP | `supertest` pour les tests d'integration |

### Lancer les tests

```bash
npm test            # Tous les tests
```

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev avec rechargement auto (nodemon + tsx) |
| `npm test` | Lancer tous les tests (Jest) |
| `npm run build` | Compilation TypeScript |
| `npm run lint` | Linter ESLint sur `src/` |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:generate` | Regenerer les types Prisma |
| `npm run db:studio` | Ouvrir Prisma Studio |
