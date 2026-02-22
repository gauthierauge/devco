# Devco

Projet full-stack avec un frontend et un backend Express.

## Structure du projet

```
devco/
├── front/          # Application (Vite + TypeScript)
├── back/           # API Express (TypeScript + Prisma)
├── docs/           # Documentation detaillée du projet
├── docker/           # Docker init
└── README.md
```

## Stack technique

### Frontend (`front/`)

| Categorie | Technologie |
|-----------|------------|
| **Langage** | TypeScript 5.9 |
| **Bundler** | Vite 7.3 |
| **CSS** | Tailwind CSS 4.1 |
| **Composants UI** | shadcn/ui + Radix UI |
| **Linter** | ESLint |

### Backend (`back/`)

| Categorie | Technologie |
|-----------|------------|
| **Runtime** | Node.js 18+ |
| **Langage** | TypeScript 5.9 |
| **Framework** | Express 5.2 |
| **Base de donnees** | PostgreSQL |
| **ORM** | Prisma 7.4 |
| **Securite** | Helmet 8.1 |
| **Logging** | Pino 10.3 |
| **Tests** | Jest 30 + Supertest |
| **Linter** | ESLint |

## Pre-requis

- **Node.js** >= 18
- **npm**
- **PostgreSQL** 

## Installation

```bash
# Cloner le repo
git clone https://github.com/gauthierauge/devco.git
cd devco
```

### Frontend

```bash
cd front
npm install
```

### Backend

```bash
cd back
npm install
```

Puis initialiser la base de donnees :

```bash
npm run db:migrate
```

> **Note :**
> Nous avons laissez le .env dans l'app pour que ce soit plus simple pour l'installation du projet

## Lancer le projet

Dans le terminal :

```bash
#lance la bdd + démarre backend et frontend
#il faut rester sur /devco
make dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |

## Commandes Make

Toutes les commandes se lancent depuis la racine du projet (`/devco`).

### Dev

| Commande | Description |
|----------|-------------|
| `make install` | Installe les dependances front et back |
| `make dev` | Lance la BDD + backend + frontend |
| `make dev-front` | Lance le frontend seul (Vite) |
| `make dev-back` | Lance le backend seul |
| `make clean` | Supprime `node_modules` et `dist` |

### Base de donnees / Docker

| Commande | Description |
|----------|-------------|
| `make db` | Demarre le conteneur PostgreSQL |
| `make db-stop` | Arrete le conteneur |
| `make db-reset` | Supprime les volumes, redemarre et migre |
| `make db-logs` | Affiche les logs du conteneur |

### Prisma

| Commande | Description |
|----------|-------------|
| `make prisma-generate` | Regenere les types Prisma |
| `make prisma-migrate` | Applique les migrations |
| `make prisma-migrate-create name=xxx` | Cree une nouvelle migration |
| `make prisma-studio` | Ouvre Prisma Studio |
| `make prisma-seed` | Execute le seed |

### Qualite

| Commande | Description |
|----------|-------------|
| `make lint` | ESLint sur front et back |
| `make test-front` | Tests Jest frontend (12 suites) |
| `make test-back` | Tests Jest backend (20 suites) |
| `make test-all` | Lance tous les tests |

## Documentation

- [Architecture du backend](docs/back/architecture.md)
- [Securite du backend](docs/back/security.md)
- [Architecture du frontend](docs/front/architecture.md)
- [Client API frontend](docs/front/api-client.md)
- [API (routes et endpoints)](docs/api.md)
- [Base de donnees](docs/database.md)
- [Docker](docs/docker.md)
- [Tests](docs/tests.md)
