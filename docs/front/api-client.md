# Client HTTP Frontend

## Vue d'ensemble

Le module `api/client.ts` fournit une fonction `request<T>()` qui encapsule `fetch` avec :

- Injection automatique du **token CSRF** sur les requetes non-GET
- Gestion des **credentials** (cookies de session)
- Parsing JSON automatique
- Gestion d'erreurs unifiee

## Fonctionnement

```typescript
const request = async <T>(url: string, options: RequestOptions = {}): Promise<T>
```

### Flux d'une requete

```
request(url, { method: "POST", body: data })
    |
    v
method !== "GET" ?
    |
    Oui -> fetchCsrfToken()            # GET /api/v1/csrf-token
    |        Ajoute X-CSRF-Token header
    |
    v
fetch(url, { method, body, headers, credentials: "include" })
    |
    v
res.ok ?
    |
    Oui -> res.status === 204 ?
    |        Oui -> return undefined
    |        Non -> return res.json()
    |
    Non -> throw new Error("Erreur {status}")
```

### Injection CSRF

Avant chaque requete qui modifie des donnees (`POST`, `PUT`, `DELETE`), le client :

1. Appelle `GET /api/v1/csrf-token` avec `credentials: "include"` pour que le cookie de session soit envoye
2. Recupere le token CSRF de la reponse
3. L'ajoute dans le header `X-CSRF-Token`

```typescript
if (method !== "GET" && credentials !== "omit") {
    headers["x-csrf-token"] = await fetchCsrfToken();
}
```

Exception : si `credentials: "omit"` est passe (cas de `/stats` qui est un endpoint public), le CSRF est ignore.

### Gestion des erreurs

Si la reponse n'est pas 2xx :

1. Tente de lire le body JSON pour extraire `body.error`
2. Si echec, utilise un message generique `"Erreur {status}"`
3. Throw un `Error` avec le message

```typescript
if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
        const body = await res.json();
        if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
}
```

## Modules API

Chaque domaine a son module API qui utilise `request()` :

### `authApi.ts`

| Fonction | Methode | Endpoint | Auth |
|----------|---------|----------|------|
| `register(email, password)` | POST | `/auth/register` | Non |
| `login(email, password)` | POST | `/auth/login` | Non |
| `logout()` | POST | `/auth/logout` | Oui |
| `getCurrentUser()` | GET | `/auth/me` | Oui |

### `productApi.ts`

| Fonction | Methode | Endpoint | Auth |
|----------|---------|----------|------|
| `listProducts(filters?)` | GET | `/products` | Non |
| `createProduct(data)` | POST | `/products` | Oui |
| `updateProduct(id, data)` | PUT | `/products/:id` | Oui |
| `deleteProduct(id)` | DELETE | `/products/:id` | Oui |

Les requetes `create` et `update` utilisent `FormData` (multipart) pour l'upload d'images.

### `cartApi.ts`

| Fonction | Methode | Endpoint | Auth |
|----------|---------|----------|------|
| `getCart()` | GET | `/cart` | Non |
| `addCartItem(productId, quantity)` | POST | `/cart/items` | Non |
| `updateCartItem(productId, quantity)` | PUT | `/cart/items/:productId` | Non |
| `removeCartItem(productId)` | DELETE | `/cart/items/:productId` | Non |
| `syncCart(items)` | POST | `/cart/sync` | Non |

Le panier est lie a la session (pas a l'authentification).

### `statsApi.ts`

| Fonction | Methode | Endpoint | Auth |
|----------|---------|----------|------|
| `listStats()` | GET | `/stats` | Non |

Utilise `credentials: "omit"` car l'endpoint est public avec CORS ouvert.

### `cspReportApi.ts`

| Fonction | Methode | Endpoint | Auth |
|----------|---------|----------|------|
| `listCspReports()` | GET | `/csp-reports` | Non |
