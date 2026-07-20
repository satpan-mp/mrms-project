# syntax=docker/dockerfile:1
#
# MRMS API image (NestJS REST + WebSocket gateway).
# INITIALIZATION SKELETON: build stages are scaffolded but application build
# steps are commented out until backend code exists (Sprint 1+). The image
# currently builds a minimal, valid base so CI `docker-build` can validate it.

# ---- Base ----
FROM node:20.11.0-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
LABEL org.opencontainers.image.title="mrms-api" \
      org.opencontainers.image.description="MRMS NestJS API + WebSocket gateway" \
      org.opencontainers.image.vendor="PT Mitra Prodin"

# ---- Dependencies (enabled in Sprint 1) ----
# FROM base AS deps
# COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# COPY apps/backend/package.json apps/backend/
# RUN pnpm install --frozen-lockfile --filter @mrms/backend...

# ---- Build (enabled in Sprint 1) ----
# FROM deps AS build
# COPY . .
# RUN pnpm --filter @mrms/backend run build

# ---- Runtime ----
FROM base AS runtime
# COPY --from=build /app/apps/backend/dist ./dist
# COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
# Placeholder entrypoint until the backend is implemented.
CMD ["node", "-e", "console.log('MRMS API image placeholder - implement in Sprint 1'); process.exit(0)"]
