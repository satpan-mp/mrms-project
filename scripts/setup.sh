#!/usr/bin/env bash
# MRMS local environment bootstrap (Linux / macOS)
# Usage: ./scripts/setup.sh
set -euo pipefail

echo "MRMS setup: bootstrapping local environment..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example - fill in real values before running."
else
  echo ".env already exists - leaving it unchanged."
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "Installing workspace dependencies with pnpm..."
  pnpm install
else
  echo "pnpm not found. Install pnpm (https://pnpm.io) then re-run."
fi

echo "Setup complete."
