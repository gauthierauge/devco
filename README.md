# Devco

Projet full-stack avec un frontend React et un backend Express.

## Structure du projet

```
devco/
├── front/          # Application React (Vite + TypeScript)
├── back/           # API Express (TypeScript + Prisma)
├── docs/           # Documentation detaillée du projet
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
- **PostgreSQL** en cours d'execution

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
cp .env.example .env
```

Editer `back/.env` avec vos identifiants :

```env
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
LOG_LEVEL="debug"
```

Puis initialiser la base de donnees :

```bash
npm run db:migrate
```

## Lancer le projet

Ouvrir deux terminaux :

```bash
# Terminal 1 — Backend (port 5000)
cd back
npm run dev

# Terminal 2 — Frontend (port 3000)
cd front
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |

## Scripts disponibles

### Frontend (`front/`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev Vite |
| `npm run build` | Build de production (tsc + vite build) |
| `npm run preview` | Preview du build de production |
| `npm run lint` | ESLint sur `src/` |

### Backend (`back/`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur dev avec rechargement auto |
| `npm run build` | Compilation TypeScript |
| `npm test` | Lancer les tests (Jest) |
| `npm run lint` | ESLint sur `src/` |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:generate` | Regenerer les types Prisma |
| `npm run db:studio` | Ouvrir Prisma Studio |

## Documentation

- [Architecture du backend](back/docs/architecture.md)
- [Securite du backend](back/docs/security.md)
