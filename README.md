# Devco — Backend

API backend du projet Devco.

## Stack technique

| Categorie | Technologie | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 18+ |
| **Langage** | TypeScript | 5.9 |
| **Framework** | Express | 5.2 |
| **Base de donnees** | PostgreSQL | — |
| **ORM** | Prisma | 7.4 |
| **Securite** | Helmet | 8.1 |
| **CORS** | cors | 2.8 |
| **Logging** | Pino | 10.3 |
| **Tests** | Jest + Supertest | 30 / 7.2 |
| **Linter** | ESLint | — |

## Pre-requis

- **Node.js** >= 18
- **npm**
- **PostgreSQL** en cours d'execution

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd devco/back

# Installer les dependances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

## Configuration

Editer le fichier `.env` :

```env
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
LOG_LEVEL="debug"
```

| Variable | Description |
|----------|-------------|
| `BACKEND_URL` | URL du serveur backend (le port est extrait automatiquement) |
| `FRONTEND_URL` | URL du frontend (origine autorisee par CORS) |
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `LOG_LEVEL` | Niveau de log : `debug`, `info`, `warn`, `error` |

## Base de donnees

```bash
# Appliquer les migrations
npm run db:migrate

# Regenerer les types Prisma
npm run db:generate

# Ouvrir Prisma Studio (interface web)
npm run db:studio
```

## Lancer le projet

```bash
# Developpement (rechargement auto)
npm run dev

# Build production
npm run build
```

## Tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev avec rechargement auto (nodemon + tsx) |
| `npm test` | Lancer les tests (Jest) |
| `npm run build` | Compilation TypeScript |
| `npm run lint` | ESLint sur `src/` |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:generate` | Regenerer les types Prisma |
| `npm run db:studio` | Ouvrir Prisma Studio |

## Documentation

### Backend

- [Architecture du backend](docs/back/architecture.md)
- [Securite](docs/back/security.md)
