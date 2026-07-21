# syntax=docker/dockerfile:1
#
# MRMS Web image: builds the Display + Admin SPAs and serves the static output
# via Nginx, which also reverse-proxies /api and /realtime to the API service
# (see infrastructure/nginx/nginx.conf).

# ---- Base ----
FROM node:20.11.0-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
ENV HUSKY=0

# ---- Dependencies ----
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

# ---- Build both SPAs ----
FROM deps AS build
COPY . .
# Serve each app under its own base path behind Nginx.
RUN pnpm --filter @mrms/display run build --base=/display/ \
 && pnpm --filter @mrms/admin run build --base=/admin/

# ---- Runtime (Nginx) ----
FROM nginx:1.27-alpine AS runtime
LABEL org.opencontainers.image.title="mrms-web" \
      org.opencontainers.image.description="MRMS Display + Admin SPAs served by Nginx" \
      org.opencontainers.image.vendor="PT Mitra Prodin"
COPY infrastructure/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/display/dist /usr/share/nginx/html/display
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html/admin
# Root landing redirects to the Admin app by default.
RUN printf '<!doctype html><meta charset="utf-8"><title>MRMS</title><meta http-equiv="refresh" content="0; url=/admin/">' \
    > /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
