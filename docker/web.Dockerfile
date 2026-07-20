# syntax=docker/dockerfile:1
#
# MRMS Web image: builds the Display + Admin SPAs and serves the static output
# via Nginx (the same Nginx also reverse-proxies /api and /realtime in compose).
# INITIALIZATION SKELETON: SPA build enabled in Sprint 5+ (display) / Sprint 10+
# (admin). For now it produces a minimal static page so CI can validate the build.

# ---- Build stage (enabled once SPAs exist) ----
# FROM node:20.11.0-alpine AS build
# WORKDIR /app
# RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
# COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# COPY apps/display/package.json apps/display/
# COPY apps/admin/package.json apps/admin/
# RUN pnpm install --frozen-lockfile
# COPY . .
# RUN pnpm --filter @mrms/display run build && pnpm --filter @mrms/admin run build

# ---- Runtime (Nginx) ----
FROM nginx:1.27-alpine AS runtime
LABEL org.opencontainers.image.title="mrms-web" \
      org.opencontainers.image.description="MRMS Display + Admin SPAs served by Nginx" \
      org.opencontainers.image.vendor="PT Mitra Prodin"
# Reverse-proxy + static hosting config.
COPY infrastructure/nginx/nginx.conf /etc/nginx/nginx.conf
# COPY --from=build /app/apps/display/dist /usr/share/nginx/html/display
# COPY --from=build /app/apps/admin/dist   /usr/share/nginx/html/admin
# Placeholder landing page until SPAs are built.
RUN mkdir -p /usr/share/nginx/html \
    && echo '<!doctype html><title>MRMS</title><h1>MRMS web placeholder</h1>' \
       > /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
