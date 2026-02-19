# Docker Compose — Documentation

## Vue d'ensemble

Le fichier `docker-compose.yml` configure un conteneur PostgreSQL 16 (Alpine) sécurisé pour l'environnement de développement du projet.

---

## Configuration détaillée

### Image et versioning

```yaml
image: postgres:16-alpine@sha256:97ff59a4e30e...
```

L'image est **pinnée par hash SHA256**. Contrairement au tag `postgres:16-alpine` qui peut changer silencieusement lors d'une mise à jour, le hash garantit que tous les membres de l'équipe utilisent exactement la même version de l'image. Cela élimine les problèmes de type "ça marche chez moi".

---

### Réseau

```yaml
ports:
  - "127.0.0.1:${DB_PORT:-5432}:5432"
networks:
  - backend
```

Le port est bindé sur `127.0.0.1` uniquement. Sans ce préfixe, Docker expose le port sur `0.0.0.0`, ce qui rend la base de données accessible à n'importe quelle machine sur le réseau local. Avec `127.0.0.1`, seul l'hôte local peut se connecter.

Le réseau `backend` (bridge) isole les conteneurs dans un réseau Docker dédié. Si d'autres services sont ajoutés plus tard (Redis, API, etc.), ils pourront communiquer entre eux sans être exposés à l'extérieur.

---

### Authentification

```yaml
environment:
  POSTGRES_INITDB_ARGS: "--auth=scram-sha-256"
  POSTGRES_HOST_AUTH_METHOD: scram-sha-256
```

**SCRAM-SHA-256** remplace l'authentification MD5 par défaut de PostgreSQL. C'est la méthode la plus sécurisée disponible : les mots de passe sont hashés avec un sel unique et un nombre configurable d'itérations, ce qui rend les attaques par dictionnaire et par rainbow tables beaucoup plus coûteuses.

- `POSTGRES_INITDB_ARGS` : applique SCRAM-SHA-256 lors de l'initialisation de la base.
- `POSTGRES_HOST_AUTH_METHOD` : force cette méthode pour toutes les connexions entrantes.

---

### Initialisation

```yaml
volumes:
  - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

Au premier démarrage du conteneur, PostgreSQL exécute automatiquement les scripts placés dans `/docker-entrypoint-initdb.d/`. Le fichier `init.sql` crée un utilisateur applicatif avec des droits limités (principe du moindre privilège). Le flag `:ro` (read-only) empêche le conteneur de modifier ce fichier.

L'utilisateur admin (`DB_USER`) sert uniquement aux migrations Prisma. L'utilisateur applicatif créé par `init.sql` n'a que les droits `SELECT`, `INSERT`, `UPDATE`, `DELETE` — il ne peut ni créer ni supprimer de tables.

---

### Healthcheck

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Vérifie toutes les 10 secondes que PostgreSQL est prêt à accepter des connexions. Après 5 échecs consécutifs (50 secondes), Docker marque le conteneur comme `unhealthy`. Cela permet aux autres services de ne pas démarrer tant que la base n'est pas prête (`depends_on: condition: service_healthy`).

---

### Sécurité du conteneur

```yaml
security_opt:
  - no-new-privileges:true
```

Empêche tout processus à l'intérieur du conteneur d'obtenir plus de privilèges que son processus parent. Cela bloque l'escalade de privilèges via `setuid`, `setgid`, ou des exploits du noyau.

---

### Filesystem temporaire

```yaml
tmpfs:
  - /tmp
  - /run
```

Monte `/tmp` et `/run` en mémoire (tmpfs). Ces répertoires sont volatils : leur contenu disparaît à l'arrêt du conteneur. Cela empêche l'écriture de données persistantes en dehors du volume `pg_data` et améliore les performances des opérations temporaires.

---

### Limites de ressources

```yaml
deploy:
  resources:
    limits:
      memory: 512M
```

Plafonne la consommation mémoire du conteneur à 512 Mo. Sans cette limite, un bug ou une requête malformée pourrait consommer toute la RAM de l'hôte et impacter les autres processus.

---

### Logging

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

Limite les logs Docker à 3 fichiers de 10 Mo maximum (30 Mo total). Sans cette configuration, les logs grossissent indéfiniment et peuvent remplir le disque de l'hôte.

---

### Arrêt propre

```yaml
restart: unless-stopped
stop_grace_period: 30s
```

- `restart: unless-stopped` : le conteneur redémarre automatiquement après un crash ou un reboot, sauf s'il a été arrêté manuellement avec `docker compose down`.
- `stop_grace_period: 30s` : laisse 30 secondes à PostgreSQL pour terminer les transactions en cours et se fermer proprement avant un arrêt forcé. Cela prévient la corruption de données.

---

### Persistance des données

```yaml
volumes:
  pg_data:
```

Volume Docker nommé qui stocke les données PostgreSQL. Les données survivent aux arrêts, redémarrages et suppressions du conteneur. Seul un `docker volume rm pg_data` explicite supprime les données.

---

## Variables d'environnement requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_USER` | Utilisateur admin PostgreSQL | `devco-admin` |
| `DB_PASSWORD` | Mot de passe admin | `devco-password` |
| `DB_NAME` | Nom de la base de données | `devco-db` |
| `DB_PORT` | Port (optionnel, défaut: 5432) | `5432` |

Ces variables doivent être définies dans un fichier `.env` à la racine du projet.

---

## Commandes utiles

```bash
# Démarrer la base de données
docker compose up -d

# Vérifier le statut (healthy/unhealthy)
docker ps

# Voir les logs
docker compose logs -f devco-db

# Arrêter
docker compose down
```
