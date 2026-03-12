#!/bin/sh
set -eu

echo "Waiting for database..."
node scripts/wait-for-db.mjs

echo "Applying Prisma migrations..."
migrate_log="$(mktemp)"

if npx prisma migrate deploy 2>&1 | tee "$migrate_log"; then
  rm -f "$migrate_log"
else
  if grep -q "Error: P3005" "$migrate_log" && [ "${ALLOW_DB_PUSH_FALLBACK:-false}" = "true" ]; then
    echo "Existing schema detected. Falling back to prisma db push for local Docker verification..."
    npx prisma db push --skip-generate
    rm -f "$migrate_log"
  else
    cat "$migrate_log"
    rm -f "$migrate_log"
    exit 1
  fi
fi

if [ "${SEED_ON_BOOT:-false}" = "true" ]; then
  echo "Seeding database if empty..."
  node scripts/seed-if-empty.mjs
fi

echo "Starting Next.js..."
exec npm run start -- --hostname 0.0.0.0 --port "${PORT:-3000}"
