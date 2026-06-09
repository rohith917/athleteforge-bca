#!/usr/bin/env bash
# Render start — runs from repo ROOT (Root Directory = blank)
set -o errexit
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT/backend"
exec gunicorn athlete_system.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 2 --threads 2 --timeout 120