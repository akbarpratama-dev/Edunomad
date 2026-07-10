# EduNomad backend — Express + TypeScript + Prisma 7 (driver adapter, no native
# query engine). Multi-stage: build compiles TS + generates the Prisma client,
# runtime ships only production deps + the compiled dist.
#
# Build context is this backend/ folder (see fly.toml). The npm-workspaces root
# lockfile is not needed here because backend/package.json is self-contained.

# ---- Stage 1: build ----
FROM node:22-slim AS builder
WORKDIR /app

# openssl is needed by Prisma during generate on Debian slim images.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .
# `npm run build` = prisma generate + tsc -p tsconfig.build.json (see package.json)
RUN npm run build

# ---- Stage 2: runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Compiled app (includes the generated Prisma client at dist/generated/prisma).
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
