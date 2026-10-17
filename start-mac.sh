#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js LTS from https://nodejs.org, then run this script again.'
  exit 1
fi
node -e "if(Number(process.versions.node.split('.')[0]) < 22) { console.error('Please install Node.js 22 or newer.'); process.exit(1); }"
npm ci --omit=dev --cache "${TMPDIR:-/tmp}/wild-putt-npm"
exec npm run host
