# Tests

## Lancer les tests

```bash
# Backend (20 suites, 97 tests)
cd back && npm test

# Frontend (12 suites, 52 tests)
cd front && npm test

# Tout d'un coup
make test-all
```

---

## Backend

**Framework :** Jest avec `ts-jest` et ESM (`--experimental-vm-modules`)

### Structure

```
back/tests/
├── units/                              # Tests unitaires
│   ├── auth.controller.test.ts         # Handlers register, login, logout, me
│   ├── auth.middleware.test.ts         # Verification session userId
│   ├── auth.service.test.ts            # Register, login, getCurrentUser, password policy
│   ├── cspNonce.middleware.test.ts      # Generation nonce base64
│   ├── cspReport.controller.test.ts    # Reception et liste des rapports CSP
│   ├── cspReport.service.test.ts       # Sauvegarde, validation, cleanup
│   ├── csrf.middleware.test.ts         # Generation et verification CSRF
│   ├── csrf.util.test.ts              # Secret, token, verify
│   ├── error.middleware.test.ts        # HttpError, asyncHandler, 404, errorHandler
│   ├── file.util.test.ts              # deleteUploadedFiles, toFilePath, path traversal
│   ├── password.util.test.ts          # Hash bcrypt et validation
│   ├── product.controller.test.ts      # CRUD produits + nettoyage images
│   ├── product.service.test.ts        # Filtres Prisma, delegation au repository
│   ├── reportTo.middleware.test.ts     # Header Report-To
│   ├── requestLogger.middleware.test.ts# Logs info/warn/error selon status code
│   ├── stats.controller.test.ts       # Endpoint stats
│   ├── stats.service.test.ts          # groupBy Prisma et transformation
│   └── xssSanitizer.middleware.test.ts # Sanitization XSS (strings, objets, tableaux)
├── integration/                        # Tests d'integration
│   ├── product.integration.test.ts     # CRUD complet via supertest + Prisma
│   └── cspReport.integration.test.ts   # Routes CSP via supertest
└── fixtures/
    └── test.jpg                        # Image pour les tests d'upload
```

### Strategie de mocking

`jest.unstable_mockModule()` pour les modules ESM :

| Dependance | Mock |
|-----------|------|
| Prisma (DB) | `{ prisma: {} }` |
| Repositories | Mock des fonctions du repository |
| Services | Mock des fonctions du service |
| Logger | `{ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }` |
| `node:fs/promises` | Mock de `unlink` |
| `@/utils/file.js` | Mock de `deleteUploadedFiles` |
| HTTP (integration) | `supertest` avec l'app Express |

### Ce qui est teste

| Couche | Modules | Tests |
|--------|---------|-------|
| Controllers | auth, product, stats, cspReport | 27 |
| Services | auth, product, stats, cspReport | 22 |
| Middlewares | auth, csrf, cspNonce, xss, reportTo, requestLogger, error | 28 |
| Utilitaires | password, csrf, file | 11 |
| Integration | products CRUD, csp-report routes | 9 |

---

## Frontend

**Framework :** Jest avec `ts-jest`, `jsdom` et `moduleNameMapper` pour l'alias `@/`

**Configuration speciale :** Un `tsconfig.jest.json` etend le `tsconfig.json` principal en desactivant `verbatimModuleSyntax` et en passant en `module: "commonjs"` pour la compatibilite avec Jest.

### Structure

```
front/tests/
├── productService.test.ts      # formatPrice, toView, filterProducts
├── statsService.test.ts        # totalCount, toView (pourcentages)
├── cspReportService.test.ts    # toView (mapping champs, date fr-FR)
├── statsPresenter.test.ts      # toStatListView (displayName)
├── cspReportPresenter.test.ts  # presentCspReportRow, presentCspReportTable
├── productPresenter.test.ts    # toProductCardView (resolution imageUrl)
├── client.test.ts              # request() : GET, POST, CSRF token, erreurs, 204
├── authApi.test.ts             # register, login, logout, getCurrentUser
├── productApi.test.ts          # listProducts, createProduct, deleteProduct
├── statsApi.test.ts            # listStats (credentials: "omit")
├── authService.test.ts         # register/login/logout + localStorage, validateSession
└── protect.test.ts             # checkRouteAccess (public, protected, auth-only)
```

### Strategie de mocking

- `jest.mock("@/config/env", ...)` pour controler `API_URL`
- `jest.mock("../src/api/client", ...)` pour isoler les modules API
- `globalThis.fetch = jest.fn()` pour tester le client HTTP
- `localStorage` fourni nativement par jsdom

### Ce qui est teste

| Couche | Modules | Tests |
|--------|---------|-------|
| Services | productService, statsService, cspReportService, authService | 25 |
| Mappers | statsPresenter, cspReportPresenter, productPresenter | 8 |
| API | client, authApi, productApi, statsApi | 16 |
| Router | protect (checkRouteAccess) | 4 |

### Ce qui n'est pas teste (couvert en E2E)

- **Pages** (`src/pages/`) : orchestration de composants + appels API
- **Composants** (`ProductCard`, `SearchBar`, etc.) : manipulation du DOM via `mount()`
- **Router `index.ts`** : `history.pushState`, `document.querySelector`
- **Config/Constantes** : pas de logique testable
