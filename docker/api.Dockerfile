# syntax=docker/dockerfile:1
#
# MRMS API image (NestJS REST + WebSocket gateway).
# Multi-stage pnpm-workspace build: install (cached on manifests) -> build the
# backend (+ generate Prisma client) -> lean runtime that runs the compiled app.

# ---- Base ----
FROM node:20.11.0-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
# Husky is a dev-only git hook manager; never run it inside the image.
ENV HUSKY=0
LABEL org.opencontainers.image.title="mrms-api" \
      org.opencontainers.image.description="MRMS NestJS API + WebSocket gateway" \
      org.opencontainers.image.vendor="PT Mitra Prodin"

# ---- Dependencies (cached until a manifest or the lockfile changes) ----
FROM base AS deps
ENV NODE_ENV=development
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/realtime/package.json ./packages/realtime/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/ui/package.json ./packages/ui/
COPY apps/backend/package.json ./apps/backend/
COPY apps/admin/package.json ./apps/admin/
COPY apps/display/package.json ./apps/display/
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY . .
RUN pnpm --filter @mrms/backend exec prisma generate \
 && pnpm --filter @mrms/backend run build

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=production
# Installed modules (workspace store) + compiled backend + Prisma schema/client.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
