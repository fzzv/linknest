# Linknest DB

This package contains the database schema for the Linknest project.

## Getting Started

```bash
pnpm install
pnpm build
```

## Generate

```bash
pnpm generate:docs
```

## Migration

```bash
npx prisma migrate reset
npx prisma migrate dev --name <migration-name>
npx prisma migrate resolve --applied <migration-name>
```

## Usage

```typescript
import { PrismaService } from '@linknest/db';
```
