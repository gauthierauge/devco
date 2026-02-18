# Securite du Backend

## Vue d'ensemble

La securite du backend repose sur plusieurs couches complementaires :

| Couche | Fichier | Fonction |
|--------|---------|----------|
| **Helmet** | `config/helmet.ts` | CSP, HSTS, headers securite |
| **Nonce CSP** | `middleware/security/cspNonce.ts` | Scripts inline autorises par nonce |
| **Trusted Types** | `config/helmet.ts` | Protection DOM XSS |
| **Report-To** | `middleware/security/reportTo.ts` | Reporting des violations CSP |
| **CSP Reporting** | `controllers/`, `services/`, `repositories/` | Reception et stockage des rapports |
| **CORS** | `config/cors.ts` | Controle des origines autorisees |
| **HSTS** | `config/helmet.ts` | Force HTTPS |

## Helmet & Content Security Policy (CSP)

### Directives CSP (`config/helmet.ts`)

```
defaultSrc        : 'self'
scriptSrc         : 'unsafe-inline', 'nonce-<dynamique>'
styleSrc          : 'self'
imgSrc            : 'self', data:, blob:
connectSrc        : 'self', BACKEND_URL
fontSrc           : 'self'
objectSrc         : 'none'
frameAncestors    : 'none'
baseUri           : 'self'
formAction        : 'self'
requireTrustedTypesFor : 'script'
reportUri         : /api/csp-report
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

Cela renforce la protection contre les attaques XSS basees sur le DOM.

## Report-To / CSP Reporting

### Header Report-To (`middleware/security/reportTo.ts`)

Chaque reponse inclut le header :

```json
{
  "group": "csp-endpoint",
  "max_age": 10886400,
  "endpoints": [{ "url": "http://localhost:5000/api/csp-report" }]
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
3. Il envoie un POST /api/csp-report avec le payload :
   {
     "csp-report": {
       "document-uri": "https://example.com",
       "violated-directive": "script-src",
       "blocked-uri": "https://evil.com",
       ...
     }
   }
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

Le service maintient un maximum de **100 rapports** en base. Lors de la lecture (`GET /api/csp-reports`), si le nombre depasse `MAX_REPORTS`, les plus anciens sont supprimes :

```
count > 100 ?
  -> Oui : supprime les (count - 100) plus anciens
  -> Non : rien a faire
```

### Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/csp-report` | Reception d'un rapport CSP (204) |
| `GET` | `/api/csp-reports` | Liste des rapports (avec cleanup) |

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

Une configuration ouverte (`openCors`) est exportee pour de futurs endpoints publics :

| Option | Valeur |
|--------|--------|
| `origin` | `*` |
| `methods` | `GET` |
| `maxAge` | `600` |

## HSTS (HTTP Strict Transport Security)

### Configuration

```typescript
hsts: {
  maxAge: 31536000,        // 1 an
  includeSubDomains: true, // Couvre tous les sous-domaines
  preload: true,           // Eligible a la preload list des navigateurs
}
```

### Fonctionnement

- Le navigateur recoit le header `Strict-Transport-Security`
- Pendant 1 an, toute tentative d'acces en HTTP est automatiquement redirigee en HTTPS
- `includeSubDomains` etend cette protection aux sous-domaines
- `preload` permet de soumettre le domaine a la [liste preload HSTS](https://hstspreload.org/) integree aux navigateurs

### Protection

- Empeche les attaques de type **downgrade** (HTTPS -> HTTP)
- Protege contre le **SSL stripping** (interception pour forcer le HTTP)
