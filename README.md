# LinkNest

[中文 README](./README_zh.md)

LinkNest is a link aggregation platform built as a Turborepo monorepo (Web + API + DB).

## Preview

![Preview](docs/preview.png)

## Features

- **Web**: Next.js 15 + React 19, Tailwind CSS v4 + daisyUI, next-intl, Zod, Zustand
- **API**: NestJS, JWT auth, Swagger docs (`/docs`), upload support, i18n
- **Database**: Prisma + MySQL, Redis cache/session support
- **Tooling**: pnpm workspace, Turborepo, Docker/Compose
- **Bookmarks import**: Chrome-exported HTML and custom JSON format (see `apps/api/README.md`)

## Installation

Prerequisites:

- Node.js `>=18` (recommended: Node 22)
- pnpm (repo uses `pnpm@8.15.5` via Corepack)

```bash
corepack enable
pnpm install
```

## Development / Local Run

### Option A: Docker one-command (recommended)

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build
```

Default endpoints (configurable in `docker/.env`):

- Web: `http://localhost:3001`
- API: `http://localhost:3000` (Swagger: `http://localhost:3000/docs`)

More details: `docker/README.md`.

### Option B: Run services locally (DB/Redis via Docker)

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml up -d mysql redis

cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env

pnpm -C packages/db exec prisma generate --schema prisma/schema.prisma --generator client
pnpm -C packages/db exec prisma migrate deploy --schema prisma/schema.prisma
pnpm --filter @linknest/db build
pnpm -C packages/db run seed:default-links
pnpm dev
```

## License

MIT - see `LICENSE`.
