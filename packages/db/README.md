# Linknest DB

This package contains the database schema for the Linknest project.

## Getting Started

```bash
pnpm install
pnpm build
```

## Generate

```bash
pnpm run generate # prisma generate
```

## Migration

```bash
pnpm run reset # npx prisma migrate reset
pnpm run migrate # npx prisma migrate dev
npx prisma migrate dev --name <migration-name>
npx prisma migrate resolve --applied <migration-name>
```

## Usage

```typescript
import { PrismaService } from '@linknest/db';
```

## init default links

```bash
pnpm run seed:default-links
```
