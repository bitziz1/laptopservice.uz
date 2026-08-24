# Multi-stage build for laptopservice.uz

# Stage 1: Build static assets
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with high-performance Caddy
FROM caddy:2-alpine
WORKDIR /srv

COPY --from=builder /app/dist /srv/dist
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]