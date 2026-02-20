# Securite du Backend

## Vue d'ensemble

La securite repose sur une strategie de **defense en profondeur** avec plusieurs couches complementaires :

| Couche | Fichier | Fonction |
|--------|---------|----------|
| **Helmet** | `config/helmet.ts` | CSP, HSTS, headers securite |
| **Nonce CSP** | `middleware/security/cspNonce.ts` | Scripts inline autorises par nonce |
| **Trusted Types** | `config/helmet.ts` | Protection DOM XSS |
| **CSRF** | `middleware/security/csrf.ts` | Protection contre les requetes forgees |
| **Rate Limiting** | `middleware/security/rateLimiter.ts` | Limite les requetes par IP |
| **XSS Sanitizer** | `middleware/security/xssSanitizer.ts` | Nettoie les inputs utilisateur |
| **Sessions** | `middleware/session.ts` | Sessions securisees en base (Prisma) |
| **Authentification** | `middleware/security/auth.ts` | Verification session.userId |
| **Password Policy** | `services/auth.service.ts` | Politique de mots de passe stricte |
| **Upload Security** | `middleware/upload.ts` | Validation MIME + magic number |
| **Image Cleanup** | `utils/file.ts` | Suppression des images orphelines |
| **Report-To** | `middleware/security/reportTo.ts` | Reporting des violations CSP |
| **CORS** | `config/cors.ts` | Controle des origines autorisees |
| **HSTS** | `config/helmet.ts` | Force HTTPS |

---

## Helmet & Content Security Policy (CSP)

### Directives CSP (`config/helmet.ts`)

```
defaultSrc        : 'self'
scriptSrc         : 'unsafe-inline', 'nonce-<dynamique>'
styleSrc          : 'self'
imgSrc            : 'self', data:, blob:, BACKEND_URL
connectSrc        : 'self', BACKEND_URL
fontSrc           : 'self'
objectSrc         : 'none'
frameAncestors    : 'none'
baseUri           : 'self'
formAction        : 'self'
requireTrustedTypesFor : 'script'
reportUri         : /api/v1/csp-report
reportTo          : csp-endpoint
```

### Explication des directives

| Directive | Valeur | Pourquoi |
|-----------|--------|----------|
| `defaultSrc` | `'self'` | Par defaut, seules les ressources du meme domaine sont chargees |
| `scriptSrc` | `'unsafe-inline'` + nonce | Autorise les scripts inline qui possedent le bon nonce |
| `objectSrc` | `'none'` | Bloque Flash, Java, et autres plugins |
| `frameAncestors` | `'none'` | Empeche l'embedding dans un iframe (protection clickjacking) |
| `connectSrc` | `'self'` + `BACKEND_URL` | Autorise les appels API vers le backend |
| `formAction` | `'self'` | Les formulaires ne peuvent soumettre que vers le meme domaine |

### Autres headers Helmet

```
Cross-Origin-Embedder-Policy  : desactive (false)
Referrer-Policy                : strict-origin-when-cross-origin
```

---

## Nonce CSP

### Fonctionnement (`middleware/security/cspNonce.ts`)

A chaque requete, un nonce unique est genere :

```typescript
res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
```

Ce nonce est injecte dans la directive `scriptSrc` du CSP via helmet :

```typescript
scriptSrc: [
  "'unsafe-inline'",
  (_req, res) => `'nonce-${res.locals.cspNonce}'`
]
```

### Usage cote front

Le front doit ajouter l'attribut `nonce` sur ses balises `<script>` pour que le navigateur les autorise :

```html
<script nonce="aB3dEf7gHi...">
  // Ce script est autorise car il porte le nonce de la requete
</script>
```

Les scripts sans nonce (ou avec un nonce invalide) sont bloques par le navigateur et une violation CSP est reportee.

---

## Trusted Types

### Configuration

```typescript
requireTrustedTypesFor: ["'script'"]
```

### Impact

Trusted Types est une API navigateur qui empeche les manipulations DOM dangereuses :

- `element.innerHTML = data` -> **bloque** (doit utiliser `TrustedHTML`)
- `scriptElement.src = url` -> **bloque** (doit utiliser `TrustedScriptURL`)
- `eval(code)` -> **bloque** (doit utiliser `TrustedScript`)

Le front doit creer une politique Trusted Types pour les operations qui manipulent le DOM :

```javascript
const policy = trustedTypes.createPolicy("default", {
  createHTML: (input) => DOMPurify.sanitize(input),
});
```

---

## Protection CSRF

### Fonctionnement (`middleware/security/csrf.ts`)

Le CSRF (Cross-Site Request Forgery) est gere par un systeme de token lie a la session.

### Generation

A chaque requete, le middleware `csrfGenerateMiddleware` :

1. Initialise un **secret CSRF** en session (si absent) via `csrfTokens.secretSync()`
2. Genere un **token CSRF** a partir du secret via `csrfTokens.create(secret)`
3. Stocke le token en session et dans `res.locals.csrfToken`

### Verification

Le middleware `csrfVerifyMiddleware` s'execute sur les requetes **non-GET** (`POST`, `PUT`, `DELETE`) :

1. Recupere le secret depuis la session
2. Recupere le token depuis `req.body.csrfToken` **ou** le header `X-CSRF-Token`
3. Verifie le token avec `csrfTokens.verify(secret, token)`
4. Rejette avec `403` si invalide

### Methodes GET/HEAD/OPTIONS

Ces methodes sont **exclues** de la verification CSRF car elles sont idempotentes :

```typescript
if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
}
```

### Flux cote client

```
1. Client -> GET /api/v1/csrf-token (avec cookie de session)
2. Serveur -> { csrfToken: "..." }
3. Client -> POST /api/v1/products (header X-CSRF-Token: "...")
4. Serveur -> verifie le token, traite la requete
```

### Erreurs possibles

| Status | Message |
|--------|---------|
| 403 | `CSRF secret not found in session` |
| 403 | `CSRF token not provided` |
| 403 | `Invalid CSRF token` |

---

## Rate Limiting

### Configuration (`middleware/security/rateLimiter.ts`)

```typescript
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    limit: 100,                 // 100 requetes par fenetre
    standardHeaders: "draft-7", // Headers RateLimit-* standard
    legacyHeaders: false,       // Pas de X-RateLimit-*
    message: { error: "Trop de requêtes, réessayez plus tard" },
})
```

### Comportement

- Applique a **toutes les routes** (middleware global)
- Compte par adresse IP
- Fenetre glissante de 15 minutes
- Apres 100 requetes : reponse `429 Too Many Requests`

---

## XSS Sanitizer

### Fonctionnement (`middleware/security/xssSanitizer.ts`)

Le middleware `xssSanitizer` nettoie **recursivement** toutes les valeurs de `req.body` :

```typescript
const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === "string") return filterXSS(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)])
        );
    }
    return value;
};
```

### Ce qui est nettoye

- Strings : `filterXSS()` de la lib `xss` encode les balises HTML dangereuses
- Tableaux : chaque element est nettoye recursivement
- Objets imbriques : chaque valeur est nettoyee recursivement
- Autres types (number, boolean, null) : passes tels quels

### Exemple

```
Input:  { "label": "<script>alert('xss')</script>" }
Output: { "label": "&lt;script&gt;alert('xss')&lt;/script&gt;" }
```

---

## Gestion des Sessions

### PrismaStore (`middleware/session.ts`)

Les sessions sont stockees en base de donnees via un store custom `PrismaStore` qui etend `express-session.Store` :

| Methode | Comportement |
|---------|-------------|
| `get(sid)` | Lit la session en base, verifie `expiresAt`, supprime si expiree |
| `set(sid, data)` | Upsert (cree ou met a jour) avec `expiresAt` |
| `destroy(sid)` | Supprime la session, silencieux si deja absente (P2025) |
| `touch(sid, data)` | Met a jour `expiresAt` sans modifier les donnees |
| `clear()` | Supprime toutes les sessions |

### Configuration du cookie

```typescript
cookie: {
    secure: process.env.NODE_ENV === "production",  // HTTPS only en prod
    httpOnly: true,                                   // Inaccessible en JavaScript
    sameSite: "lax",                                  // Protection CSRF navigateur
    maxAge: 24 * 60 * 60 * 1000,                     // 24 heures
}
```

### Avantages du PrismaStore

- **Persistance** : les sessions survivent aux redemarrages du serveur
- **Scalabilite** : partageables entre plusieurs instances
- **Expiration** : geree en base, pas en memoire

---

## Politique de mots de passe

### Regles (`services/auth.service.ts`)

| Regle | Valeur |
|-------|--------|
| Longueur minimum | 15 caracteres |
| Longueur maximum | 128 caracteres |
| Mots de passe bloques | Liste noire (password, 123456, admin, qwerty, azerty, etc.) |
| Information utilisateur | Le mot de passe ne doit pas contenir le local-part ou le domaine de l'email |

### Hashage

- **bcrypt** avec **10 salt rounds** (`utils/password.ts`)
- Le hash est stocke dans `User.password`

### Blocklist

```typescript
const BLOCKED_PASSWORDS = new Set([
    "password", "password1", "123456", "123456789",
    "qwerty", "azerty", "admin", "letmein",
    "welcome", "iloveyou", "devco", "maisondeco", "maison déco",
]);
```

### Verification contextuelle

```typescript
const [localPart, domain] = email.toLowerCase().split("@");
if (normalized.includes(localPart)) return true;  // Bloque
if (normalized.includes(domain)) return true;      // Bloque
```

---

## Securite des uploads

### Validation (`middleware/upload.ts`)

L'upload d'images passe par un parsing multipart custom avec plusieurs couches de validation :

| Etape | Verification |
|-------|-------------|
| 1 | Content-Type multipart/form-data avec boundary |
| 2 | MIME type du header `Content-Type` dans la whitelist |
| 3 | **Magic number** (signature binaire) du contenu du fichier |
| 4 | **Coherence** MIME header vs magic number (rejet si mismatch) |
| 5 | Taille du fichier <= 2 Mo |
| 6 | Nombre de fichiers <= 5 |
| 7 | Taille totale du body <= 10 Mo |

### Formats autorises

| Format | MIME | Magic number |
|--------|------|-------------|
| JPEG | `image/jpeg` | `FF D8 FF` |
| PNG | `image/png` | `89 50 4E 47 0D 0A 1A 0A` |
| GIF | `image/gif` | `GIF87a` ou `GIF89a` |
| WebP | `image/webp` | `RIFF....WEBP` |

### Stockage

- Fichiers ecrits dans `public/uploads/` avec un nom UUID + extension
- Chemins relatifs stockes en base : `/uploads/{uuid}.jpg`

### Headers de securite sur /uploads

```typescript
app.use("/uploads", express.static("public/uploads", {
    dotfiles: "deny",
    setHeaders: (res) => {
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "public, max-age=86400");
    },
}));
```

- `dotfiles: deny` : bloque l'acces aux fichiers caches (`.htaccess`, `.env`, etc.)
- `nosniff` : empeche le navigateur de deviner le MIME type
- Cache 24h pour les images

---

## Nettoyage des images orphelines

### Fonctionnement (`utils/file.ts`)

Quand un produit est mis a jour avec de nouvelles images ou supprime, les anciens fichiers sont supprimes du disque :

```typescript
// Dans update, si de nouvelles images sont envoyees :
if (images) {
    void deleteUploadedFiles(existing.images);
}

// Dans remove, apres suppression en base :
void deleteUploadedFiles(existing.images);
```

### Implementation

- `toFilePath(imagePath)` : extrait le basename (protection path traversal) et construit le chemin absolu
- `safeUnlink(filePath)` : supprime le fichier, silencieux en cas d'erreur (log warn)
- `deleteUploadedFiles(imagePaths)` : map + Promise.all, fire-and-forget (`void`)

La suppression est **fire-and-forget** : on n'attend pas que les fichiers soient supprimes pour repondre au client. Si un fichier n'existe pas ou est verrouille, l'erreur est loguee sans impacter la reponse.

---

## Report-To / CSP Reporting

### Header Report-To (`middleware/security/reportTo.ts`)

Chaque reponse inclut le header :

```json
{
  "group": "csp-endpoint",
  "max_age": 10886400,
  "endpoints": [{ "url": "http://localhost:5000/api/v1/csp-report" }]
}
```

Le navigateur utilise ce header pour savoir ou envoyer les rapports de violations.

### Flux complet de reporting

```
1. Le navigateur detecte une violation CSP
      |
      v
2. Il lit le header "Report-To" de la reponse
      |
      v
3. Il envoie un POST /api/v1/csp-report avec le payload
      |
      v
4. Le controller extrait le payload
      |
      v
5. Le service valide :
   - Le payload est un objet (pas null, pas un tableau)
   - Champs requis presents : "document-uri", "violated-directive"
   - Seuls les champs autorises sont acceptes
      |
      v
6. Le repository sauvegarde en base (table CspReport, colonne JSON)
      |
      v
7. Reponse 204 No Content (toujours, meme si invalide)
```

### Champs CSP autorises (`constants/cspReport.constant.ts`)

| Champ | Description |
|-------|-------------|
| `document-uri` | URL de la page ou la violation s'est produite |
| `referrer` | Referrer de la page |
| `violated-directive` | Directive CSP violee (ex: `script-src`) |
| `effective-directive` | Directive effective apres resolution |
| `original-policy` | Politique CSP complete |
| `disposition` | `enforce` ou `report` |
| `blocked-uri` | Ressource bloquee |
| `line-number` | Ligne du script fautif |
| `column-number` | Colonne du script fautif |
| `source-file` | Fichier source |
| `status-code` | Code HTTP de la page |
| `script-sample` | Extrait du script bloque |

### Cleanup automatique

Le service maintient un maximum de **100 rapports** en base. Lors de la lecture (`GET /api/v1/csp-reports`), si le nombre depasse `MAX_REPORTS`, les plus anciens sont supprimes.

---

## CORS

### Configuration restrictive (`config/cors.ts`)

Appliquee a toutes les routes :

| Option | Valeur | Explication |
|--------|--------|-------------|
| `origin` | `FRONTEND_URL` | Seul le front autorise |
| `credentials` | `true` | Autorise cookies et headers d'auth |
| `methods` | `GET, POST, PUT, DELETE, OPTIONS` | Methodes HTTP autorisees |
| `allowedHeaders` | `Content-Type, Authorization, X-CSRF-Token` | Headers autorises |
| `exposedHeaders` | `X-CSRF-Token` | Headers exposes au client |
| `maxAge` | `600` | Cache preflight 10 minutes |

### Configuration ouverte

Une configuration ouverte (`openCors`) est utilisee pour l'endpoint `/stats` :

| Option | Valeur |
|--------|--------|
| `origin` | `*` |
| `methods` | `GET` |
| `maxAge` | `600` |

---

## HSTS (HTTP Strict Transport Security)

### Configuration

```typescript
hsts: {
  maxAge: 31536000,        // 1 an
  includeSubDomains: true, // Couvre tous les sous-domaines
  preload: true,           // Eligible a la preload list des navigateurs
}
```

### Protection

- Empeche les attaques de type **downgrade** (HTTPS -> HTTP)
- Protege contre le **SSL stripping** (interception pour forcer le HTTP)
- `preload` permet de soumettre le domaine a la [liste preload HSTS](https://hstspreload.org/) integree aux navigateurs

---

## Authentification

### Middleware (`middleware/security/auth.ts`)

Le middleware `authMiddleware` verifie la presence de `userId` en session :

```typescript
const authMiddleware = (req, res, next) => {
    const userId = req.session.userId;
    if (!userId) throw new HttpError(401, "Unauthorized");
    req.userId = userId;
    next();
};
```

### Routes protegees

| Route | Middleware |
|-------|-----------|
| `POST /auth/logout` | `authMiddleware` |
| `GET /auth/me` | `authMiddleware` |
| `POST /products` | `authMiddleware` + `uploadImages` |
| `PUT /products/:id` | `authMiddleware` + `uploadImages` |
| `DELETE /products/:id` | `authMiddleware` |

Les routes de lecture (`GET /products`, `GET /stats`, etc.) sont publiques.
