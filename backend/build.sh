#!/usr/bin/env bash
# Render.com build script — Django API + React SPA (same origin)
set -o errexit

pip install -r requirements.txt

if command -v npm >/dev/null 2>&1; then
  echo "Building React frontend (same-origin /api)..."
  cd ../frontend
  npm ci 2>/dev/null || npm install
  VITE_API_URL=/api npm run build
  cd ../backend
  rm -rf frontend_dist
  mkdir -p frontend_dist
  cp -r ../frontend/dist/* frontend_dist/
  echo "Frontend built and copied to backend/frontend_dist"
elif [ -f frontend_dist/index.html ]; then
  echo "Using pre-built frontend_dist from repository"
else
  echo "ERROR: No npm and no frontend_dist — SPA will not load"
  exit 1
fi

python manage.py collectstatic --no-input
python manage.py migrate --no-input
python manage.py setup_admin
python manage.py seed_data