#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="v91mx/almost/screensOneBzipzip"

cd "$PROJECT_DIR"
npm ci --no-audit --no-fund
npm run build