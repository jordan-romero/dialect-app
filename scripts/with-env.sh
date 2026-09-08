#!/usr/bin/env bash
# Run a command with secrets sourced from Doppler when this repo is set up for
# it (see doppler.yaml), otherwise fall back to a local .env. Keeps scripts like
# `yarn seed` working whether or not a contributor uses Doppler.
#
# Usage: scripts/with-env.sh <command> [args...]
set -euo pipefail

# Already inside `doppler run` (it injects DOPPLER_PROJECT) — just run.
if [ -n "${DOPPLER_PROJECT:-}" ]; then
  exec "$@"
fi

# Doppler is installed and this directory is scoped to a project → use it.
if command -v doppler >/dev/null 2>&1 &&
  doppler configure get project --plain >/dev/null 2>&1; then
  exec doppler run -- "$@"
fi

# Fallback: no Doppler → load a local .env into the environment, then run.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi
exec "$@"
