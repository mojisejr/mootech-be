#!/usr/bin/env bash
# container-smoke.sh — build the mootech-be image from THIS revision and prove, on the built image (not a dev
# server), the three things mumate-infra-move-001 slice 1 asks of it:
#
#   1. hygiene   no .env of any spelling inside the image; no credential-shaped string in the layer history
#   2. refusal   DB_SYNCHRONIZE=true makes the process exit non-zero before it touches a database
#   3. readiness with a real database, GET /health answers 200 {db:"ok"} after a SELECT 1 round trip, and GET /
#                still answers "Hello World!" (Render's health path today — unchanged)
#
# Usage:
#   bash scripts/container-smoke.sh                    # all three; DB env from $SMOKE_ENV_FILE (see below)
#   bash scripts/container-smoke.sh --no-db            # 1 + 2 only (CI without a database)
#
# SMOKE_ENV_FILE  env file for step 3. Default: the arena's committed local env, ../mootech-fe/testenv/env/be.env
#                 (dummy secrets, docker Postgres on :5433). `localhost` is rewritten to host.docker.internal so
#                 the container reaches the host's Postgres. Never point this at production.
# SMOKE_PORT      host port to publish (default 4100).
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"
SHA="$(git rev-parse HEAD)"
TAG="mootech-be:smoke-${SHA:0:12}"
NO_DB=0; [ "${1:-}" = "--no-db" ] && NO_DB=1
PORT="${SMOKE_PORT:-4100}"
CNAME="mootech-be-smoke-$$"
fail() { echo "❌ $*" >&2; exit 1; }
cleanup() { docker rm -f "$CNAME" >/dev/null 2>&1 || true; rm -f "${ENV_TMP:-}"; }
trap cleanup EXIT

echo "── build ${TAG} (APP_GIT_SHA=${SHA:0:12}) ──"
docker build --build-arg "APP_GIT_SHA=${SHA}" -t "$TAG" . | tail -3

echo "── 1. hygiene ──"
envs=$(docker run --rm --entrypoint sh "$TAG" -c 'find /app -maxdepth 2 \( -name ".env" -o -name ".env.*" -o -name "*.testenv-shadowed" \) 2>/dev/null' || true)
[ -z "$envs" ] || fail "env file(s) inside the image: $envs"
if docker history --no-trunc "$TAG" | grep -Eiq 'DB_PASSWORD=|SECRET=[^$]|_KEY=[^$]|postgres(ql)?://[^ ]*:[^ ]*@'; then
  fail "credential-shaped string in image history"
fi
who=$(docker run --rm --entrypoint id "$TAG" -un); [ "$who" = "node" ] || fail "runs as $who, expected node"
# canvas is the one native dependency; prove it loads AND renders Thai with the repo font inside the runner
# (the share-card path in card.service.ts) — a missing shared lib or font only shows up at request time otherwise.
png=$(docker run --rm "$TAG" node -e "const c=require('canvas');c.registerFont('src/assets/fonts/IBMPlexSansThai-Regular.ttf',{family:'T'});const v=c.createCanvas(120,40);const x=v.getContext('2d');x.font='20px T';x.fillText('ทดสอบ',5,28);process.stdout.write(String(v.toBuffer('image/png').length))") || fail "canvas failed to load/render in the runner"
[ "${png:-0}" -gt 100 ] || fail "canvas rendered an empty PNG ($png bytes)"
echo "   ✅ no env files, clean history, runs as node, canvas+Thai font render ($png-byte PNG)"

echo "── 2. DB_SYNCHRONIZE refusal ──"
set +e
out=$(docker run --rm -e DB_SYNCHRONIZE=true -e DB_HOST=127.0.0.1 "$TAG" 2>&1); rc=$?
set -e
[ "$rc" -ne 0 ] || fail "process started with DB_SYNCHRONIZE=true (rc=0)"
echo "$out" | grep -q '\[runtime-guard\]' || fail "exit was non-zero but not from runtime-guard: $out"
echo "   ✅ exit rc=$rc with: $(echo "$out" | grep '\[runtime-guard\]' | cut -c1-90)…"

if [ "$NO_DB" = 1 ]; then echo "── 3. readiness SKIPPED (--no-db) — NOT CHECKED ──"; exit 0; fi

echo "── 3. readiness against a real database ──"
ENV_SRC="${SMOKE_ENV_FILE:-$HERE/../mootech-fe/testenv/env/be.env}"
[ -f "$ENV_SRC" ] || fail "SMOKE_ENV_FILE not found: $ENV_SRC"
grep -Eq '^DB_HOST=(localhost|127\.0\.0\.1|host\.docker\.internal)$' "$ENV_SRC" || fail "refusing: $ENV_SRC DB_HOST is not a local host"
ENV_TMP="$(mktemp)"
grep -v '^#' "$ENV_SRC" | grep . | sed 's/localhost/host.docker.internal/g' > "$ENV_TMP"
docker run -d --name "$CNAME" --env-file "$ENV_TMP" -e PORT=3000 -p "${PORT}:3000" "$TAG" >/dev/null
for i in $(seq 1 45); do
  body=$(curl -fsS "http://127.0.0.1:${PORT}/health" 2>/dev/null) && break
  sleep 2
done
[ -n "${body:-}" ] || { docker logs "$CNAME" | tail -20; fail "/health never answered 200 within 90s"; }
echo "$body" | grep -q '"db":"ok"' || fail "/health answered but db is not ok: $body"
echo "$body" | grep -q "\"sha\":\"${SHA}\"" || fail "/health does not report the built SHA: $body"
root=$(curl -fsS "http://127.0.0.1:${PORT}/")
[ "$root" = "Hello World!" ] || fail "GET / changed: $root"
hc=$(docker inspect --format '{{.State.Health.Status}}' "$CNAME" 2>/dev/null || echo n/a)
echo "   ✅ /health → $body"
echo "   ✅ /       → $root · docker HEALTHCHECK state: $hc"
echo "✅ smoke passed for ${SHA}"
