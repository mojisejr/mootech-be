# syntax=docker/dockerfile:1.7
# mootech-be — the same NestJS service Render runs today, as a reproducible image (mumate-infra-move-001 slice 1).
#
# Parity first, then hygiene:
#   • Base pinned to the manifest digest `node:19-alpine` resolved to on 2026-09-18 (= 19.9.0-alpine3.18) — the
#     runtime Render builds from `FROM node:19-alpine` right now. Node 19 is EOL; moving off it is a decision for
#     a later slice, not a side effect of containerising. Change BASE in one place when that decision is recorded.
#   • The Thai font is copied from the repository (src/assets/fonts, byte-identical to the file the old Dockerfile
#     downloaded from GitHub at build time) — no network fetch inside the build.
#   • Build tools and dev dependencies stay in the builder stage; the runner carries only what `node dist/main`
#     needs: dist/, production node_modules (canvas compiled in the builder), src/assets (fonts registered by
#     card.service.ts via process.cwd()), public/ (card backgrounds), package.json.
#   • No .env of any name is ever COPYed — .dockerignore excludes them all, and configuration reaches the process
#     only through the runtime environment. APP_GIT_SHA is the only build argument and it is not a secret.
#
# Build:  docker build --build-arg APP_GIT_SHA=$(git rev-parse HEAD) -t mootech-be:local .
# Smoke:  bash scripts/container-smoke.sh   (builds, proves the DB_SYNCHRONIZE refusal, proves /health against a DB)

ARG BASE=node:19.9.0-alpine3.18@sha256:8ec543d4795e2e85af924a24f8acb039792ae9fe8a42ad5b4bf4c277ab34b62e

# ── builder: native deps for canvas + full install + nest build ────────────────────────────────────────────────
FROM ${BASE} AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++ pkgconfig \
      cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build \
 && npm prune --omit=dev --no-audit --no-fund

# ── runner: shared libs only, non-root, one process ────────────────────────────────────────────────────────────
FROM ${BASE} AS runner
ARG APP_GIT_SHA=unknown
# DB_SYNCHRONIZE=false is the safe default; the process refuses to start if anything overrides it to true
# (src/runtime-guard.ts).
ENV NODE_ENV=production \
    APP_GIT_SHA=${APP_GIT_SHA} \
    DB_SYNCHRONIZE=false \
    PORT=3000
WORKDIR /app
RUN apk add --no-cache cairo pango jpeg giflib librsvg pixman fontconfig \
 && mkdir -p /usr/share/fonts/ibm-thai
# Same single system font the old image fetched from IBM/plex v6.3.0 — from the repo, not the network.
COPY --from=builder /app/src/assets/fonts/IBMPlexSansThai-Regular.ttf /usr/share/fonts/ibm-thai/
RUN fc-cache -f >/dev/null
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/src/assets ./src/assets
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
# Liveness = the real /health (SELECT 1 round trip), not `/`. node 19 has global fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main"]
