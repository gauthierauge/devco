.PHONY: install dev dev-front dev-back \
       db db-stop db-reset db-logs \
       prisma-generate prisma-migrate prisma-studio prisma-seed \
       lint test test-back test-front clean

# ── Setup ──────────────────────────────────────────────

install:
	cd front && npm install
	cd back && npm install

clean:
	rm -rf front/node_modules front/dist
	rm -rf back/node_modules back/dist

# ── Dev ────────────────────────────────────────────────

dev:
	$(MAKE) db
	$(MAKE) -j2 dev-back dev-front

dev-front:
	cd front && npm run dev

dev-back:
	cd back && npm run dev

# ── Docker / Database ─────────────────────────────────

db:
	docker compose up -d

db-stop:
	docker compose down

db-reset:
	docker compose down -v
	docker compose up -d
	$(MAKE) prisma-migrate

db-logs:
	docker compose logs -f

# ── Prisma ─────────────────────────────────────────────

prisma-generate:
	cd back && npx prisma generate

prisma-migrate:
	cd back && npx prisma migrate dev

prisma-migrate-create:
	cd back && npx prisma migrate dev --create-only --name $(name)

prisma-studio:
	cd back && npx prisma studio

prisma-seed:
	cd back && npx prisma db seed

# ── Quality ────────────────────────────────────────────

lint:
	cd front && npm run lint
	cd back && npm run lint

test:
	$(MAKE) test-back test-front

test-back:
	cd back && npm test

test-front:
	cd front && npm test