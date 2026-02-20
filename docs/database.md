# Base de donnees

## Stack

| Technologie | Version | Role |
|-------------|---------|------|
| PostgreSQL | 16 (Alpine) | SGBD relationnel |
| Prisma | 7.4 | ORM + migrations |
| `@prisma/adapter-pg` | — | Adaptateur PostgreSQL pour Prisma |

## Schema

### User

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  sessions  Session[]
}
```

- `email` : unique, sert d'identifiant de connexion
- `password` : hash bcrypt (10 salt rounds)
- Relation 1-N avec `Session`

### Session

```prisma
model Session {
  id        String   @id
  data      Json
  expiresAt DateTime
  userId    Int?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- Store custom pour `express-session` (classe `PrismaStore`)
- `data` : contenu de la session (userId, cart, csrf tokens) en JSON
- `expiresAt` : expiration automatique (24h)
- `onDelete: Cascade` : supprimer un User supprime ses sessions

### Product

```prisma
model Product {
  id          String   @id @default(cuid())
  label       String
  description String
  images      String[]
  price       Decimal  @db.Decimal(7, 2)
  category    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

- `id` : CUID (collision-resistant unique ID)
- `images` : tableau de chemins relatifs (`/uploads/uuid.jpg`)
- `price` : Decimal(7,2) — max 99 999,99

### CspReport

```prisma
model CspReport {
  id        Int      @id @default(autoincrement())
  payload   Json
  createdAt DateTime @default(now())
}
```

- Stocke les rapports de violations CSP en JSON
- Limite a 100 rapports (cleanup automatique des plus anciens)

## Diagramme des relations

```
User 1 --- N Session
```

`Product` et `CspReport` sont des entites independantes sans relations.

## Principe du moindre privilege

Deux utilisateurs PostgreSQL distincts :

### Utilisateur admin (`DB_USER`)

- Cree via Docker Compose (`POSTGRES_USER`)
- Utilise par **Prisma** pour les migrations (`prisma migrate dev`)
- A tous les droits sur la base

### Utilisateur applicatif (`devco_app`)

- Cree par `docker/init.sql` au premier demarrage
- Utilise par l'application en runtime
- Droits limites :

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO devco_app;
-- Pas de CREATE, DROP, ALTER, TRUNCATE
```

L'application ne peut ni creer ni supprimer de tables, meme en cas de compromission.

## Connexion (`config/db.ts`)

Le client Prisma utilise l'adaptateur `@prisma/adapter-pg` pour se connecter a PostgreSQL via la variable `DATABASE_URL`.

Les types sont auto-generes dans `src/generated/prisma/`.

## Migrations

Les migrations sont gerees par Prisma et stockees dans `prisma/migrations/` (trackees en Git).

### Commandes

| Commande | Description |
|----------|-------------|
| `make prisma-migrate` | Appliquer les migrations en dev |
| `make prisma-migrate-create name=nom` | Creer une nouvelle migration |
| `make prisma-generate` | Regenerer les types TypeScript |
| `make prisma-studio` | Interface web Prisma Studio |
| `make prisma-seed` | Executer le seed |
| `make db-reset` | Supprimer le volume + recreer la base + migrer |
