#!/usr/bin/env bash
# Dev runner: starts the Stripe webhook relay (so local test purchases actually
# unlock content) alongside `next dev`. Secrets are never hardcoded — they come
# from Doppler when this repo is set up for it (see doppler.yaml), otherwise
# from a local .env. If the Stripe CLI or key is missing, it just runs Next
# without the relay.

# Re-exec once under `doppler run` so both `next dev` and `stripe listen`
# inherit the injected secrets. DOPPLER_PROJECT is set by `doppler run`, which
# guards against a re-exec loop.
if [ -z "${DOPPLER_PROJECT:-}" ] && command -v doppler >/dev/null 2>&1 &&
  doppler configure get project --plain >/dev/null 2>&1; then
  exec doppler run -- bash "$0" "$@"
fi

# Fallback when Doppler isn't set up: load .env so secrets are available here.
if [ -z "${DOPPLER_PROJECT:-}" ]; then
  set -a
  # shellcheck disable=SC1091
  [ -f .env ] && . ./.env
  set +a
fi

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
