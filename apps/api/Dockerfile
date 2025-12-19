# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.11.0
ARG PNPM_VERSION=8.15.5
ARG TURBO_VERSION=2.6.0

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS pruner
ARG TURBO_VERSION
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune api --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ ./
COPY .npmrc* ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm -C packages/db exec prisma generate --schema prisma/schema.prisma --generator client
RUN pnpm --filter api... build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=installer /app /app
EXPOSE 3000
CMD ["sh", "-c", "cd /app/packages/db && node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma && node /app/packages/db/dist/src/seed-default-links.js && node /app/apps/api/dist/main"]
