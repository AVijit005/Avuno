# syntax=docker/dockerfile:1
# Chronicle Backend — Production multi-stage build

ARG NODE_VERSION=22

# ── Stage 1: Build (dev dependencies present) ──
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ── Stage 2: Production dependencies only ──
# Built separately so the runtime image does not ship @nestjs/cli, eslint,
# prettier, typescript, husky and the rest of devDependencies. The previous
# image copied the builder's full node_modules (~700 MB).
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 3: Runtime ──
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# wget backs the HEALTHCHECK below.
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 chronicle && \
    adduser --system --uid 1001 chronicle

COPY --from=builder --chown=chronicle:chronicle /app/dist ./dist
COPY --from=deps    --chown=chronicle:chronicle /app/node_modules ./node_modules
COPY --from=builder --chown=chronicle:chronicle /app/package.json ./
COPY --from=builder --chown=chronicle:chronicle /app/prisma ./prisma

USER chronicle

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

STOPSIGNAL SIGTERM

CMD ["node", "dist/main"]
