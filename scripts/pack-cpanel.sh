#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUTPUT_ZIP="bakti-cpanel-ready.zip"

echo "1/4 Generating Prisma Client (native + rhel-openssl)..."
npx prisma generate

echo "2/4 Building Next.js production bundle..."
npm run build

echo "3/4 Preparing upload directories..."
mkdir -p public/uploads/audio public/uploads/tts-cache

echo "4/4 Creating $OUTPUT_ZIP..."
rm -f "$OUTPUT_ZIP"
zip -rq "$OUTPUT_ZIP" \
  .next \
  public \
  prisma \
  server.js \
  package.json \
  package-lock.json \
  next.config.js \
  -x "*.DS_Store" ".next/cache/*" ".next/trace" "public/uploads/tts-cache/*.mp3"

ZIP_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
echo "Selesai! Paket deployment cPanel berhasil dibuat: $OUTPUT_ZIP ($ZIP_SIZE)"
