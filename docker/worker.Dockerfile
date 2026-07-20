# syntax=docker/dockerfile:1
#
# MRMS Worker image (BullMQ workers: calendar sync, no-show sweep, telemetry
# rollups, watch-channel renewal).
# INITIALIZATION SKELETON: application build enabled in Sprint 1+.

FROM node:20.11.0-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
LABEL org.opencontainers.image.title="mrms-worker" \
      org.opencontainers.image.description="MRMS BullMQ background workers" \
      org.opencontainers.image.vendor="PT Mitra Prodin"

# ---- Dependencies / Build (enabled in Sprint 1) ----
# FROM base AS build
# COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# COPY apps/backend/package.json apps/backend/
# RUN pnpm install --frozen-lockfile --filter @mrms/backend...
# COPY . .
# RUN pnpm --filter @mrms/backend run build

FROM base AS runtime
# COPY --from=build /app/apps/backend/dist ./dist
# COPY --from=build /app/node_modules ./node_modules
# Worker has no exposed port; it consumes queues via Redis.
CMD ["node", "-e", "console.log('MRMS Worker image placeholder - implement in Sprint 1'); process.exit(0)"]
