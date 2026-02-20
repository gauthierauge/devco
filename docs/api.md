# Reference API

Base URL : `http://localhost:5000/api/v1`

Toutes les requetes non-GET necessitent un **token CSRF** (header `X-CSRF-Token` ou champ `csrfToken` dans le body).

---

## CSRF

### `GET /csrf-token`

Retourne un token CSRF lie a la session courante.

**Reponse :**

```json
{ "csrfToken": "..." }
```

---

## Authentification

### `POST /auth/register`

Cree un compte et connecte l'utilisateur (session).

**Body :**

```json
{ "email": "user@example.com", "password": "monMotDePasse15chars" }
```

**Reponse 201 :**

```json
{ "id": 1, "email": "user@example.com" }
```

**Erreurs :**

| Status | Message |
|--------|---------|
| 400 | `Email and password are required` |
| 400 | `Email already in use` |
| 400 | `Password must be at least 15 characters` |
| 400 | `Password must be at most 128 characters` |
| 400 | `Password is too common or contains user information` |

---

### `POST /auth/login`

Connecte l'utilisateur.

**Body :**

```json
{ "email": "user@example.com", "password": "monMotDePasse15chars" }
```

**Reponse 200 :**

```json
{ "id": 1, "email": "user@example.com" }
```

**Erreurs :**

| Status | Message |
|--------|---------|
| 400 | `Email and password are required` |
| 401 | `Invalid email or password` |

---

### `POST /auth/logout` (auth requise)

Detruit la session.

**Reponse 200 :**

```json
{ "message": "Logged out successfully" }
```

---

### `GET /auth/me` (auth requise)

Retourne l'utilisateur connecte.

**Reponse 200 :**

```json
{ "id": 1, "email": "user@example.com" }
```

---

## Produits

### `GET /products`

Liste les produits avec filtres optionnels.

**Query params :**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Recherche texte (label, description, categorie) |
| `category` | string | Filtre par categorie exacte |

**Reponse 200 :**

```json
[
  {
    "id": "clx...",
    "label": "Lampe artisanale",
    "description": "Lampe en bois flotté",
    "images": ["/uploads/abc123.jpg"],
    "price": 89.99,
    "category": "Luminaires",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### `GET /products/:id`

Retourne un produit par son ID.

**Reponse 200 :** objet produit (meme format que ci-dessus)

**Erreur 404 :** `{ "message": "Product not found" }`

---

### `POST /products` (auth requise)

Cree un produit. Requete **multipart/form-data**.

**Champs :**

| Champ | Type | Requis |
|-------|------|--------|
| `label` | string | Oui |
| `description` | string | Oui |
| `category` | string | Oui |
| `price` | number | Oui |
| `images` | fichiers | Oui (au moins 1) |

**Contraintes images :**

- Formats : JPEG, PNG, WebP, GIF
- Taille max : 2 Mo par fichier
- Nombre max : 5 fichiers
- Taille body max : 10 Mo

**Reponse 201 :** objet produit cree

**Erreur 400 :** `{ "message": "Missing required fields" }`

---

### `PUT /products/:id` (auth requise)

Met a jour un produit. Requete **multipart/form-data**. Tous les champs sont optionnels.

Si de nouvelles images sont envoyees, les anciennes sont supprimees du disque.

**Reponse 200 :** objet produit mis a jour

**Erreurs :**

| Status | Message |
|--------|---------|
| 400 | `Invalid price` |
| 404 | `Product not found` |

---

### `DELETE /products/:id` (auth requise)

Supprime un produit et ses images du disque.

**Reponse 204 :** pas de body

**Erreur 404 :** `Product not found`

---

## Panier

Le panier est stocke en session (pas d'authentification requise).

### `GET /cart`

**Reponse 200 :**

```json
{
  "items": [
    { "productId": "clx...", "quantity": 2 }
  ]
}
```

---

### `POST /cart/items`

Ajoute un article au panier (ou incremente la quantite si deja present).

**Body :**

```json
{ "productId": "clx...", "quantity": 1 }
```

**Reponse 200 :** `{ "items": [...] }`

**Erreur 400 :** `{ "error": "productId et quantity sont requis" }`

---

### `PUT /cart/items/:productId`

Met a jour la quantite. Si `quantity <= 0`, l'article est supprime.

**Body :**

```json
{ "quantity": 3 }
```

**Reponse 200 :** `{ "items": [...] }`

---

### `DELETE /cart/items/:productId`

Supprime un article du panier.

**Reponse 200 :** `{ "items": [...] }`

---

### `POST /cart/sync`

Synchronise le panier local avec le serveur (appele au login).

**Body :**

```json
{ "items": [{ "productId": "clx...", "quantity": 2 }] }
```

**Reponse 200 :** `{ "items": [...] }` (articles valides uniquement)

---

## Statistiques

### `GET /stats`

Endpoint public avec CORS ouvert (`origin: *`, `GET` uniquement).

**Reponse 200 :**

```json
[
  { "nom": "Luminaires", "compte": 12 },
  { "nom": "Mobilier", "compte": 8 }
]
```

---

## Rapports CSP

### `POST /csp-report`

Reception d'un rapport de violation CSP envoye par le navigateur.

**Content-Type :** `application/csp-report`

**Body :**

```json
{
  "csp-report": {
    "document-uri": "https://example.com",
    "violated-directive": "script-src",
    "blocked-uri": "https://evil.com"
  }
}
```

**Reponse 204 :** toujours (meme si le payload est invalide)

---

### `GET /csp-reports`

Liste les rapports CSP stockes (max 100, les plus anciens sont supprimes automatiquement).

**Reponse 200 :**

```json
[
  {
    "id": 1,
    "payload": { "document-uri": "...", "violated-directive": "..." },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

## Rate limiting

Toutes les routes sont soumises a un rate limiter global :

- **100 requetes** par fenetre de **15 minutes** par IP
- Headers standard `draft-7` (`RateLimit-*`)
- Reponse 429 : `{ "error": "Trop de requêtes, réessayez plus tard" }`
