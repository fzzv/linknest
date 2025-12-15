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
RUN pnpm dlx turbo@${TURBO_VERSION} prune web --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ ./
COPY .npmrc* ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm --filter web... build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=installer /app /app
EXPOSE 3001
CMD ["sh", "-c", "cd /app/apps/web && node_modules/.bin/next start -p 3001"]
