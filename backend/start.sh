#!/usr/bin/env bash
# Render start script - do NOT run migrate here (build.sh already does it)
set -o errexit

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Fix: Render Dashboard -> athleteforge-api -> Environment -> Add from Database -> athleteforge-db"
  exit 1
fi

exec gunicorn athlete_system.wsgi:application --bind 0.0.0.0:$PORT