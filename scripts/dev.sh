#!/usr/bin/env bash
# Dev runner: starts the Stripe webhook relay (so local test purchases actually
# unlock content) alongside `next dev`. The Stripe key is read from .env at
# runtime — never hardcoded. If the Stripe CLI or key is missing, it just runs
# Next without the relay.

# Load .env so STRIPE_SECRET_KEY is available to this shell.
set -a
[ -f .env ] && . ./.env
set +a

# Start from a clean build cache to avoid stale-.next ENOENT errors (which
# happen when a previous dev server was killed mid-compile).
rm -rf .next

# On exit / Ctrl+C: stop child processes (stripe listen) AND clear the cache so
# the next launch is clean too.
cleanup() {
  kill 0 2>/dev/null
  rm -rf .next 2>/dev/null
}
trap cleanup EXIT INT TERM

if command -v stripe >/dev/null 2>&1 && [ -n "${STRIPE_SECRET_KEY:-}" ]; then
  echo "▶ stripe listen → http://localhost:3000/api/stripe/webhook"
  stripe listen --api-key "$STRIPE_SECRET_KEY" \
    --forward-to localhost:3000/api/stripe/webhook &
else
  echo "ℹ Skipping Stripe webhook relay (stripe CLI or STRIPE_SECRET_KEY missing)."
fi

# Run Next in the foreground; when it stops, the trap cleans up stripe listen.
next dev
